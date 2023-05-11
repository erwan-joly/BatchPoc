/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import type { EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
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

  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <ApolloProvider client={client}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </ApolloProvider>,
      {
        onShellReady() {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          console.error(error);
          responseStatusCode = 500;
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
