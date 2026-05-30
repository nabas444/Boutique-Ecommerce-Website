FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_STRIPE_PUBLIC_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY

RUN npm run build

# Serve stage — just exposes /app/dist as a volume for nginx
FROM alpine:3.18
COPY --from=builder /app/dist /usr/share/nginx/html
VOLUME /usr/share/nginx/html
