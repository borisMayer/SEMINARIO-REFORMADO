
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM deps AS builder
COPY src ./src
COPY public ./public
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY src/styles/globals.css ./src/styles/globals.css
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm","run","start"]
