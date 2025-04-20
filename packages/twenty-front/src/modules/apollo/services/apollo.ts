// Import statements and necessary modules
import {
    ApolloClient,
    HttpLink,
    InMemoryCache,
    from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { logDebug } from '~/utils/logDebug';

// Get the server URL from environment variables with proper fallback
const getServerUrl = () => {
  if (window._env_?.REACT_APP_SERVER_BASE_URL) {
    return window._env_.REACT_APP_SERVER_BASE_URL;
  }
  
  // Default to /api for production and localhost:3000 for development
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  return 'http://localhost:3000';
};

// Create error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      logDebug(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      );
    });
  }

  if (networkError) {
    logDebug(`[Network error]: ${networkError}`);
  }
});

// Create HTTP link with proper URI
const httpLink = new HttpLink({
  uri: `${getServerUrl()}/graphql`,
  credentials: 'include',
});

// Create Apollo Client
export const createApolloClient = () => {
  return new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
    connectToDevTools: process.env.NODE_ENV !== 'production',
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
};

// Export the Apollo client instance
export const apolloClient = createApolloClient(); 