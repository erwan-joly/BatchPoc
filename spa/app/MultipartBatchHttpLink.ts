import type { Operation, FetchResult } from "@apollo/client";
import type { BatchHttpLink } from "@apollo/client/link/batch-http";
import {
  ApolloLink,
  defaultPrinter,
  checkFetcher,
  selectURI,
  fromError,
  fallbackHttpConfig,
  Observable,
  selectHttpOptionsAndBodyInternal,
  serializeFetchParameter,
  createSignalIfSupported,
} from "@apollo/client";
import {
  handleError,
  parseAndCheckHttpResponse,
} from "@apollo/client/link/http/parseAndCheckHttpResponse";
import { BatchLink } from "@apollo/client/link/batch";
import { filterOperationVariables } from "@apollo/client/link/utils";
import { canUseAsyncIteratorSymbol } from "@apollo/client/utilities";
import {
  hasDirectives,
  removeClientSetsFromDocument,
} from "@apollo/client/utilities";
import { meros } from "meros";

export function isAsyncIterableIterator(
  value: any
): value is AsyncIterableIterator<any> {
  return !!(
    canUseAsyncIteratorSymbol &&
    (value as AsyncIterableIterator<any>)[Symbol.asyncIterator]
  );
}

export class MultipartBatchHttpLink extends ApolloLink {
  private batchDebounce?: boolean;
  private batchInterval: number;
  private batchMax: number;
  private batcher: ApolloLink;

  constructor(fetchParams?: BatchHttpLink.Options) {
    super();

    let {
      uri = "/graphql",
      // use default global fetch if nothing is passed in
      fetch: fetcher,
      print = defaultPrinter,
      includeExtensions,
      preserveHeaderCase,
      batchInterval,
      batchDebounce,
      batchMax,
      batchKey,
      includeUnusedVariables = false,
      ...requestOptions
    } = fetchParams || ({} as BatchHttpLink.Options);

    // dev warnings to ensure fetch is present
    checkFetcher(fetcher);

    //fetcher is set here rather than the destructuring to ensure fetch is
    //declared before referencing it. Reference in the destructuring would cause
    //a ReferenceError
    if (!fetcher) {
      fetcher = fetch;
    }

    const linkConfig = {
      http: { includeExtensions, preserveHeaderCase },
      options: requestOptions.fetchOptions,
      credentials: requestOptions.credentials,
      headers: requestOptions.headers,
    };

    this.batchDebounce = batchDebounce;
    this.batchInterval = batchInterval || 10;
    this.batchMax = batchMax || 10;

    const batchHandler = (operations: Operation[]) => {
      const chosenURI = selectURI(operations[0], uri);

      const context = operations[0].getContext();

      const clientAwarenessHeaders: {
        "apollographql-client-name"?: string;
        "apollographql-client-version"?: string;
      } = {};
      if (context.clientAwareness) {
        const { name, version } = context.clientAwareness;
        if (name) {
          clientAwarenessHeaders["apollographql-client-name"] = name;
        }
        if (version) {
          clientAwarenessHeaders["apollographql-client-version"] = version;
        }
      }

      const contextConfig = {
        http: context.http,
        options: context.fetchOptions,
        credentials: context.credentials,
        headers: { ...clientAwarenessHeaders, ...context.headers },
      };

      const queries = operations.map(({ query }) => {
        if (hasDirectives(["client"], query)) {
          return removeClientSetsFromDocument(query);
        }

        return query;
      });

      // If we have a query that returned `null` after removing client-only
      // fields, it indicates a query that is using all client-only fields.
      if (queries.some((query) => !query)) {
        return fromError<FetchResult[]>(
          new Error(
            "BatchHttpLink: Trying to send a client-only query to the server. To send to the server, ensure a non-client field is added to the query or enable the `transformOptions.removeClientFields` option."
          )
        );
      }

      //uses fallback, link, and then context to build options
      const optsAndBody = operations.map((operation, index) => {
        const result = selectHttpOptionsAndBodyInternal(
          { ...operation, query: queries[index]! },
          print,
          fallbackHttpConfig,
          linkConfig,
          contextConfig
        );

        if (result.body.variables && !includeUnusedVariables) {
          result.body.variables = filterOperationVariables(
            result.body.variables,
            operation.query
          );
        }

        return result;
      });

      const loadedBody = optsAndBody.map(({ body }) => body);
      const options = optsAndBody[0].options;

      // There's no spec for using GET with batches.
      if (options.method === "GET") {
        return fromError<FetchResult[]>(
          new Error("apollo-link-batch-http does not support GET requests")
        );
      }

      try {
        (options as any).body = serializeFetchParameter(loadedBody, "Payload");
      } catch (parseError) {
        return fromError<FetchResult[]>(parseError);
      }

      let controller: any;
      if (!(options as any).signal) {
        const { controller: _controller, signal } = createSignalIfSupported();
        controller = _controller;
        if (controller) (options as any).signal = signal;
      }

      return new Observable<FetchResult[]>((observer) => {
        const observerNext = observer.next.bind(observer);
        fetcher!(chosenURI, options)
          /////////////////////////////////////////////////
          // changes to default BatchHttpLink begin here //
          /////////////////////////////////////////////////
          .then(meros)
          .then(async (response) => {
            // Make the raw response available in the context.
            operations.forEach((operation) =>
              operation.setContext({ response })
            );

            if (isAsyncIterableIterator(response)) {
              const results = [];
              for await (const part of response) {
                results.push(part.body as FetchResult);
              }
              observer.next?.(results);
              observer.complete?.();
            } else {
              return parseAndCheckHttpResponse(operations)(response).then(
                observerNext
              );
            }
          })
          ///////////////////////////////////////////////
          // changes to default BatchHttpLink end here //
          ///////////////////////////////////////////////
          .catch((err) => handleError(err, observer));

        return () => {
          // XXX support canceling this request
          // https://developers.google.com/web/updates/2017/09/abortable-fetch
          if (controller) controller.abort();
        };
      });
    };

    batchKey =
      batchKey ||
      ((operation: Operation) => {
        const context = operation.getContext();

        const contextConfig = {
          http: context.http,
          options: context.fetchOptions,
          credentials: context.credentials,
          headers: context.headers,
        };

        //may throw error if config not serializable
        return selectURI(operation, uri) + JSON.stringify(contextConfig);
      });

    this.batcher = new BatchLink({
      batchDebounce: this.batchDebounce,
      batchInterval: this.batchInterval,
      batchMax: this.batchMax,
      batchKey,
      batchHandler,
    });
  }

  public request(operation: Operation): Observable<FetchResult> | null {
    return this.batcher.request(operation);
  }
}
