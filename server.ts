import type http from 'node:http';

import { createRequestHandler } from '@react-router/express';
import compression from 'compression';
import open from 'open';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan, { type TokenCallbackFn } from 'morgan';
import type { ServerBuild } from 'react-router';

const DEFAULT_PORT = 4200;
const PORT = Number.parseInt(process.env.PORT || `${DEFAULT_PORT}`, 10);
const BUILD_PATH = './build/server/index.js';
const IS_DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';

const app = express();

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

// Gzip compression of responses
app.use(compression());

// Adds security headers, see https://expressjs.com/en/advanced/best-practice-security.html#use-helmet
app.use(
  helmet({
    // The added Content-Security-Policy header would break Remix
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })
);

// Adds HTTP logger
// Meetic uses seconds instead of milliseconds in "response_time"
morgan.token(
  'response-time-seconds',
  function getResponseTimeInSecondsToken(
    this: {
      'response-time': (
        req: http.IncomingMessage,
        res: http.ServerResponse<http.IncomingMessage>
      ) => number;
    },
    req,
    res
  ) {
    return (this['response-time'](req, res) / 1000).toFixed(3);
  }
);

// Meetic uses "0" instead of "-" when no content-length is present
morgan.token(
  'res-default-zero',
  function getResponseHeaderDefaultZero(
    this: { res: TokenCallbackFn },
    req,
    res,
    field
  ) {
    return this.res(req, res, field) || '0';
  }
);

if (IS_DEVELOPMENT_MODE) {
  console.log('Starting development server');

  const vite = await import('vite');
  const viteDevServer = await vite.createServer({
    server: {
      middlewareMode: true,
    },
  });

  app.use(viteDevServer.middlewares);

  // React router app
  app.use(
    '*',
    createRequestHandler({
      build: async () =>
        (await viteDevServer.ssrLoadModule(
          'virtual:react-router/server-build'
        )) as ServerBuild,
    })
  );
} else {
  console.log('Starting production server');

  app.use(
    morgan(
      '{"document_type":"accesslog","remoteaddr":":remote-addr","auth":":remote-user","time":":date[iso]","request":":method :url HTTP/:http-version","status"::status,"payload_size"::res-default-zero[content-length],"http_host":":req[host]","referrer":":referrer","user_agent":":user-agent","x_forwarded_for":":req[x-forwarded-for]","response_time"::response-time-seconds,"x_correlation_id":":req[x-correlation-id]"}'
    )
  );

  // Vite fingerprints its assets so we can cache forever.
  app.use(
    '/build',
    express.static('build/client/build', {
      immutable: true,
      maxAge: '1y',
    })
  );

  // Everything else is cached for an hour. You may want to be more aggressive with this caching.
  app.use(express.static('build/client', { maxAge: '1h' }));

  // React router app
  app.use('*', createRequestHandler({ build: await import(BUILD_PATH) }));
}

const server = app.listen(PORT, () => {
  console.log(`Express server listening at http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`)
});

['SIGHUP', 'SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    console.log(`${signal} signal received: closing HTTP server`);

    server.close(() => {
      console.log('Http server closed');
      process.exit(0);
    });
  });
});
