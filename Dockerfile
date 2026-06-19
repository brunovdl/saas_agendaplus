# 1. Instalação das dependências
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia apenas os arquivos de dependência do subdiretório
COPY agenda-saas-app/package.json agenda-saas-app/package-lock.json ./
RUN npm ci

# 2. Build da aplicação
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copia o código da pasta agenda-saas-app para o diretório de build
COPY agenda-saas-app/ .

# Desativa a telemetria do Next.js no momento do build
ENV NEXT_TELEMETRY_DISABLED 1

# Executa o build de produção do Next.js
RUN npm run build

# 3. Execução em Produção
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os assets estáticos
COPY --from=builder /app/public ./public

# Define permissões para a pasta de cache do Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copia a aplicação compilada standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# O Next.js standalone gera o server.js para iniciar a aplicação
CMD ["node", "server.js"]
