FROM node:20-alpine

WORKDIR /usr/src/app

# Instala o pnpm globalmente no container
RUN npm install -g pnpm

# Copia arquivos de dependência
COPY package.json pnpm-lock.yaml* ./

# Instala todas as dependências usando pnpm
RUN pnpm install

# Copia o restante dos arquivos do projeto
COPY . .

# Compila o projeto NestJS
RUN pnpm run build

# Expõe a porta usada pela aplicação (3002)
EXPOSE 3002

# Comando para rodar a aplicação em produção
CMD ["pnpm", "run", "start:prod"]
