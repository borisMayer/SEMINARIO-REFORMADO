FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY src ./src

ENV NODE_ENV=production

# 🔥 NO definas PORT aquí - Railway lo hace automáticamente

CMD ["npm", "start"]
