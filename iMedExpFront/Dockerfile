FROM node:20.19.4-bookworm-slim

ENV NODE_ENV=development
ENV EXPO_NO_TELEMETRY=1
ENV NPM_CONFIG_CACHE=/npm-cache

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build:design

EXPOSE 8081 19000 19001 19002

CMD ["npm", "run", "start:lan"]
