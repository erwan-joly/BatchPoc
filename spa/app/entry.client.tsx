/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";

startTransition(() => {
  const link = new BatchHttpLink({
    uri: "http://localhost:5000/graphql",
    batchMax: 5, // No more than 5 operations per batch
    batchInterval: 20 // Wait no more than 20ms after first batched operation
  });

  const client = new ApolloClient({
    ssrMode: true,
    ssrForceFetchDelay: 100,
    queryDeduplication: true,
    link: link,
    cache: new InMemoryCache(),
  });


  hydrateRoot(
    document,
    <StrictMode>
      <ApolloProvider client={client}>
        <RemixBrowser />
      </ApolloProvider>
    </StrictMode>
  );
});
