FROM node:20-alpine

WORKDIR /usr/src/app

# Instala o pnpm globalmente no container
RUN npm install -g pnpm

# Copia os arquivos de dependência
COPY package.json pnpm-lock.yaml* ./

# Instala as dependências usando pnpm
RUN pnpm install

# Copia o restante do código
COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev"]
