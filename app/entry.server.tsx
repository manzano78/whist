// import type { EntryContext } from "react-router";
// import { ServerRouter } from "react-router";
// import { renderToPipeableStream, type RenderToPipeableStreamOptions } from 'react-dom/server';
// import { isbot } from 'isbot';
// import { createReadableStreamFromReadable } from '@react-router/node';
// import { PassThrough } from "node:stream";
//
// export const streamTimeout = 10_000; // ms
//
// export default function handleRequest(
//   request: Request,
//   responseStatusCode: number,
//   responseHeaders: Headers,
//   routerContext: EntryContext
// ): Promise<Response> {
//   return new Promise((resolve, reject) => {
//     let shellRendered = false;
//     let userAgent = request.headers.get("user-agent");
//
//     // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
//     // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
//     let readyOption: keyof RenderToPipeableStreamOptions =
//       (userAgent && isbot(userAgent)) || routerContext.isSpaMode
//         ? "onAllReady"
//         : "onShellReady";
//
//     const { pipe, abort } = renderToPipeableStream(
//       <ServerRouter
//         context={routerContext}
//         url={request.url}
//       />,
//       {
//         [readyOption]() {
//           shellRendered = true;
//           const body = new PassThrough();
//           const stream = createReadableStreamFromReadable(body);
//
//           responseHeaders.set("Content-Type", "text/html");
//
//           resolve(
//             new Response(stream, {
//               headers: responseHeaders,
//               status: responseStatusCode,
//             })
//           );
//
//           pipe(body);
//         },
//         onShellError(error: unknown) {
//           reject(error);
//         },
//         onError(error: unknown) {
//           responseStatusCode = 500;
//           // Log streaming rendering errors from inside the shell.  Don't log
//           // errors encountered during initial shell rendering since they'll
//           // reject and get logged in handleDocumentRequest.
//           if (shellRendered) {
//             console.error(error);
//           }
//         },
//       }
//     )
//
//     setTimeout(abort, streamTimeout + 1_000);
//   });
// }
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

export const streamTimeout = 10_000; // ms

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext
) {
  let shellRendered = false;
  const userAgent = request.headers.get("user-agent");
  const abortController = new AbortController();

  setTimeout(() => {
    abortController.abort();
  }, streamTimeout + 1_000);

  const body = await renderToReadableStream(
    <ServerRouter
      context={routerContext}
      url={request.url}
    />,
    {
      signal: abortController.signal,
      onError(error: unknown) {
        responseStatusCode = 500;
        // Log streaming rendering errors from inside the shell.  Don't log
        // errors encountered during initial shell rendering since they'll
        // reject and get logged in handleDocumentRequest.
        if (shellRendered) {
          console.error(error);
        }
      },
    }
  );

  shellRendered = true;

  // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
  // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
