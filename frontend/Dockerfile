FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g vite

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

EXPOSE 5173

CMD ["vite", "preview", "--host"]
