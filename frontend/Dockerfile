FROM node:22-alpine

WORKDIR /app

EXPOSE 5173

# Instala dependências (node_modules é um volume nomeado) e sobe o Vite acessível na rede
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0 --port 5173"]
