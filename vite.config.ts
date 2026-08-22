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
              const handlerPath = urlPath === '/api/coupons' ? '/api/coupons.ts' : (urlPath === '/api/recent-payments' ? '/api/recent-payments.ts' : null);

              if (handlerPath) {
                try {
                  const freshEnv = loadEnv(mode, process.cwd(), '');
                  process.env.TEBEX_SECRET_KEY = freshEnv.TEBEX_SECRET_KEY || process.env.TEBEX_SECRET_KEY || env.TEBEX_SECRET_KEY;
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
