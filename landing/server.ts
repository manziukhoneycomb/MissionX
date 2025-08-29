import express from 'express';
import { promises as fsPromises } from 'fs';
import path, { resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import compression from 'compression';
import type { ViteDevServer } from 'vite';

enum HttpStatus {
  OK = 200,
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_PORT = 3001;
const DEFAULT_HOST = '0.0.0.0';
const DECIMAL_RADIX = 10;

const port = process.env.PORT ? parseInt(process.env.PORT, DECIMAL_RADIX) : DEFAULT_PORT;
const host = process.env.HOST || DEFAULT_HOST;
const isProduction = process.env.NODE_ENV === 'production';
const appUrl: string = process.env.APP_URL ?? 'http://localhost:3000';

async function startServer() {
  const app = express();

  let vite: ViteDevServer;
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');

    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(compression());
    app.use('/assets', express.static(resolve(__dirname, 'client/assets')));
    app.use(express.static(resolve(__dirname, 'public')));
    app.use(express.static(resolve(__dirname, 'client')));
  }

  app.use('*', async (req, res, next) => {
    let url = req.originalUrl.split('?')[0];
    url = url === '/' ? '/index' : url;

    try {
      let template: string;
      let render: (url: string, appUrl: string) => Promise<string>;

      if (!isProduction) {
        template = await fsPromises.readFile(resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);

        const { render: devRender } = await vite.ssrLoadModule('./src/entry-server.tsx');
        render = devRender;
      } else {
        template = await fsPromises.readFile(resolve(__dirname, './client/index.html'), 'utf-8');

        const entryPath = path.join(__dirname, 'server', 'entry-server.js');
        const { render: prodRender } = await import(pathToFileURL(entryPath).href);

        render = prodRender;
      }

      const html = await render(url, appUrl);
      let responseHtml = template.replace('<!--app-html-->', html);

      const scriptToInject: string = `<script>window.__APP_URL__ = ${JSON.stringify(appUrl)};</script>`;
      responseHtml = responseHtml.replace('</head>', `${scriptToInject}</head>`);

      res.status(HttpStatus.OK).set({ 'Content-Type': 'text/html' }).end(responseHtml);
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));

      if (vite) {
        vite.ssrFixStacktrace(error);
      }

      next(error);
    }
  });

  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
}

startServer();
