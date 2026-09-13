FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server.mjs ./server.mjs
EXPOSE 8080
CMD ["node", "server.mjs"]
