FROM node:20.8-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY index.js .
COPY memberData.json .
COPY mockData.json .
COPY mockMetaData.json .

CMD [ "node", "index.js" ]
