FROM node:20-alpine

WORKDIR /usr/src/app

# Copia arquivos de dependência
COPY package*.json ./

# Instala todas as dependências
RUN npm install --legacy-peer-deps

# Copia o restante dos arquivos do projeto
COPY . .

# Compila o projeto NestJS
RUN npm run build

# Expõe a porta usada pela aplicação (3002)
EXPOSE 3002

# Comando para rodar a aplicação em produção
CMD ["npm", "run", "start:prod"]
