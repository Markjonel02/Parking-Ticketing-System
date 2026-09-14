# Deployment Architecture

ParkGuard runs as a unified full-stack Node.js + Express + Vite service:
- **Port**: 3000 (Container standard)
- **Host**: `0.0.0.0`
- **Build**: Vite builds the optimized React client into `dist/`, and esbuild bundles `server.ts` into CommonJS `dist/server.cjs`.
- **Runtime**: `node dist/server.cjs` serves both the high-throughput REST API endpoints under `/api/*` and the single-page application from `dist/`.
- **Environment**: Compatible with Google Cloud Run, Docker containers, Kubernetes, and local Node 20+ runtimes.
