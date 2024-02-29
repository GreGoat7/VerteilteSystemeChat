# Erste Stufe: Bauen Sie das React-App
FROM node:16 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Fügen Sie diese Befehle hinzu, um das Arbeitsverzeichnis und seinen Inhalt zu überprüfen
RUN pwd
RUN ls -l

# Zweite Stufe: Einrichten von Nginx zum Ausliefern der gebauten App
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
