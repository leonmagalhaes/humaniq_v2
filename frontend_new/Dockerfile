# Estágio de build
FROM node:18-alpine as build

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY public/ public/
COPY src/ src/

# Construir a aplicação
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar build da aplicação para o diretório do nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuração personalizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 3000
EXPOSE 3000

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
