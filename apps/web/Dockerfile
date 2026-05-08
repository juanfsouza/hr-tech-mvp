# Use a imagem oficial do Bun
FROM oven/bun:latest
WORKDIR /usr/src/app

# Copiar apenas arquivos de dependência
COPY package.json ./

# Instalar dependências de forma limpa no Linux
RUN bun install

# Copiar o restante do código (ignorando node_modules local via .dockerignore)
COPY . .

# Variáveis de ambiente
ENV NODE_ENV=development
ENV NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1

# Rodar o servidor de desenvolvimento
EXPOSE 3000
CMD ["bun", "run", "dev"]
