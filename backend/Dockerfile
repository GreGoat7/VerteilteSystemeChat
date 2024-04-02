FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
# wait-for-it hilft beim Warten auf die rabbitmq-Verbindung
COPY wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN chmod +x /usr/src/app/wait-for-it.sh
COPY . .
EXPOSE 4000
CMD [ "/usr/src/app/wait-for-it.sh", "rabbitmq:5672", "--", "node", "app.js" ]

