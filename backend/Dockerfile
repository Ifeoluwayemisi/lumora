FROM node:18-alpine AS builder
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN apk add --no-cache python3 make g++ libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --production=false
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build
FROM node:18-alpine AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN apk add --no-cache bash
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/package.json ./package.json
RUN mkdir -p /usr/src/app/uploads /usr/src/app/uploads/certificates /usr/src/app/uploads/qrs /usr/src/app/uploads/products
EXPOSE 4000
CMD ["node", "dist/server.js"]
