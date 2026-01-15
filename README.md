# Lumora — Universal Product Verification Platform (Scaffold)

This repository contains the Lumora MVP scaffold:
- Backend: Node.js + TypeScript + Fastify + Prisma + MySQL
- Frontend: Next.js + TypeScript + Tailwind CSS + PWA
- Local uploads (uploads/)
- Redis (for queue and rate-limiter), ClamAV (virus scan), BullMQ worker for heavy AI tasks
- CI: GitHub Actions workflow that builds backend & frontend and Docker images
- docker-compose for local demo: MySQL, Redis, ClamAV, backend, frontend

Run the provided create_lumora_project.sh to recreate this scaffold locally.

See backend/.env.example and frontend/.env.example for environment variables. Do NOT commit real secrets to the repo.
