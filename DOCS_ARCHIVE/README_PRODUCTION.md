Production & CI quickstart

1) GitHub Actions CI:
   - The .github/workflows/ci.yml builds backend and frontend and Docker images.

2) Local Docker-based demo:
   - Ensure Docker & Docker Compose are installed.
   - docker-compose up --build
   - Inside backend container:
       npx prisma generate
       npx prisma migrate deploy
       npm run seed:demo
       npm run worker
       npm run start
   - Frontend available at http://localhost:3000
   - Backend available at http://localhost:4000/api

3) Deploy:
   - Backend: Render (or similar); run web and worker services.
   - Frontend: Netlify/Vercel; set NEXT_PUBLIC_API_BASE to backend URL.
