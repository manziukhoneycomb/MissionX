FROM node:18-alpine AS builder

ARG VITE_API_URL=/
ARG VITE_CLERK_PUBLISHABLE_KEY=""

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .

RUN VITE_API_URL=${VITE_API_URL} VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY} npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]