# FROM node:20-slim AS base
# WORKDIR /app

# # Installerer pnpm
# RUN corepack enable
# RUN corepack prepare pnpm@latest --activate

# # Installerer dependencies
# FROM base AS deps
# COPY package.json ./
# RUN pnpm install

# # Bygger appen
# FROM base AS builder
# COPY . .
# COPY --from=deps /app/node_modules ./node_modules
# RUN pnpm run build



# Produksjons image
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/

# COPY --from=builder /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]