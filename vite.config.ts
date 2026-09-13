import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'api-serverless-local-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/')) {
              const urlPath = req.url.split('?')[0];
              const API_ROUTES: Record<string, string> = {
                '/api/points': '/api/points.ts',
                '/api/wheel': '/api/wheel.ts',
                '/api/coupons': '/api/coupons.ts',
                '/api/recent-payments': '/api/recent-payments.ts',
                '/api/stats': '/api/stats.ts',
                '/api/track': '/api/track.ts',
                '/api/tebex-webhook': '/api/tebex-webhook.ts',
                '/api/auth/discord/sync': '/api/auth/discord/sync.ts',
                '/api/auth/discord/login': '/api/auth/discord/login.ts',
                '/api/auth/discord/callback': '/api/auth/discord/callback.ts'
              };

              const handlerPath = API_ROUTES[urlPath];

              if (handlerPath) {
                try {
                  const freshEnv = loadEnv(mode, process.cwd(), '');
                  Object.assign(process.env, freshEnv);

                  let body: any = {};
                  if (req.method === 'POST' || req.method === 'PUT') {
                    const buffers: any[] = [];
                    for await (const chunk of req) {
                      buffers.push(chunk);
                    }
                    const rawBody = Buffer.concat(buffers).toString();
                    try {
                      body = JSON.parse(rawBody);
                    } catch {
                      body = rawBody;
                    }
                  }
                  (req as any).body = body;

                  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
                  const query: Record<string, string> = {};
                  parsedUrl.searchParams.forEach((val, key) => { query[key] = val; });
                  (req as any).query = query;

                  const module = await server.ssrLoadModule(handlerPath);
                  const handler = module.default;

                  const mockRes = {
                    setHeader: (k: string, v: string) => res.setHeader(k, v),
                    status: (code: number) => {
                      res.statusCode = code;
                      return mockRes;
                    },
                    json: (data: any) => {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                    },
                    redirect: (codeOrUrl: any, maybeUrl?: any) => {
                      const status = typeof codeOrUrl === 'number' ? codeOrUrl : 302;
                      const target = typeof codeOrUrl === 'string' ? codeOrUrl : maybeUrl;
                      res.statusCode = status;
                      res.setHeader('Location', target);
                      res.end();
                    },
                    end: (d?: any) => res.end(d)
                  };

                  await handler(req, mockRes);
                  return;
                } catch (err: any) {
                  console.error('[API Middleware Error]:', err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                  return;
                }
              }
            }
            next();
          });
        }
      }
    ],
    server: {
      port: 3000,
      open: false
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('canvas-confetti')) {
                return 'vendor-confetti';
              }
              return 'vendor-libs';
            }
          }
        }
      },
      chunkSizeWarningLimit: 800
    }
  };
});
