import { useMemo } from 'react'
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  HttpLink,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined

function createApolloClient() {
  // create an authentication link
  const authLink = setContext((_, { headers }) => {
    // Get the auth token from localStorage if it exists
    // Token set within localStorage
    const token = localStorage.getItem('token')
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  })
  const httpLink = new HttpLink({
    uri: 'http://localhost:8000/graphql',
    credentials: 'include',
  })

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  })
}

// Inititalise apollo client with context and initial state
export function initializeApollo(initialState: any = null) {
  const _apolloClient = apolloClient ?? createApolloClient()

  // Initial apollo client state gets re-hydrated
  if (initialState) {
    _apolloClient.cache.restore(initialState)
  }

  // New Apollo client for SSR or SSG
  if (typeof window === 'undefined') return _apolloClient

  // Create apollo client once
  if (!apolloClient) apolloClient = _apolloClient 
  return _apolloClient
}

export function useApollo(initialState: any) {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}