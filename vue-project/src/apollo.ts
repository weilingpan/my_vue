import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';

const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:9000/graphql' }),
  cache: new InMemoryCache(),
});

export default apolloClient;