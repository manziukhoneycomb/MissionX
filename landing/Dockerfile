FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Build the SSR application
RUN npm run build:ssr

# Compile server.ts to server.js
RUN npx tsc -p tsconfig.server.json

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm ci --production --legacy-peer-deps --ignore-scripts

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
