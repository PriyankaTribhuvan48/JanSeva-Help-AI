import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { analyzeCitizenRequest, generatePolicymakerRecommendation } from './server/geminiHandler';

function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
  });
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server-plugin',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url?.startsWith('/api/')) {
              return next();
            }

            res.setHeader('Content-Type', 'application/json');

            try {
              if (req.url === '/api/gemini/analyze' && req.method === 'POST') {
                const body = await parseBody(req);
                const result = await analyzeCitizenRequest(body);
                res.statusCode = 200;
                res.end(JSON.stringify(result));
                return;
              }

              if (req.url === '/api/gemini/recommendation' && req.method === 'POST') {
                const body = await parseBody(req);
                const result = await generatePolicymakerRecommendation(body);
                res.statusCode = 200;
                res.end(JSON.stringify(result));
                return;
              }

              if (req.url === '/api/health') {
                res.statusCode = 200;
                res.end(JSON.stringify({ status: 'ok', service: 'JansevaHelp-AI' }));
                return;
              }

              if (req.url === '/api/requests' && req.method === 'POST') {
                const body = await parseBody(req);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, request: body }));
                return;
              }

              next();
            } catch (error: any) {
              console.error('API Error in Vite Middleware:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

