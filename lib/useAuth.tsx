import { useState, useContext, createContext, useEffect } from 'react'
import { useApolloClient } from '@apollo/client'
import { useRouter } from 'next/router'

import { useSignInMutation } from 'lib/graphql/signin.graphql'
import { useSignUpMutation } from 'lib/graphql/signup.graphql'
import { useCurrentUserQuery } from 'lib/graphql/currentUser.graphql'

type AuthProps = {
  user: any
  error: string
  signIn: (email: any, password: any) => Promise<void>
  signUp: (email: any, password: any) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<Partial<AuthProps>>({})

export function AuthProvider({ children }) {
  const auth = useProvideAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Hook for accessing the context
export const useAuth = () => {
  return useContext(AuthContext)
}

function useProvideAuth() {
  const client = useApolloClient()
  const router = useRouter()

  const [error, setError] = useState('')
  const { data } = useCurrentUserQuery({
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  })
  const user = data && data.currentUser

  // Sign in and Sign up
  const [signInMutation] = useSignInMutation()
  const [signUpMutation] = useSignUpMutation()

  const signIn = async (email, password) => {
    try {
      const { data } = await signInMutation({ variables: { email, password } })
      if (data.login.token && data.login.user) {
        localStorage.setItem('token', data.login.token)
        client.resetStore().then(() => {
          router.push('/')
        })
      } else {
        setError('Invalid Login')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const signUp = async (email, password) => {
    try {
      const { data } = await signUpMutation({ variables: { email, password } })
      if (data.register.token && data.register.user) {
        localStorage.setItem('token', data.register.token)
        client.resetStore().then(() => {
          router.push('/')
        })
      } else {
        setError('Invalid Signup')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const signOut = () => {
    localStorage.removeItem('token')
    client.resetStore().then(() => {
      router.push('/')
    })
  }

  return {
    user,
    error,
    signIn,
    signUp,
    signOut,
  }
}
