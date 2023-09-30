# Verwende das offizielle Node.js-Image als Basis
FROM node:14

# Setze das Arbeitsverzeichnis im Container
WORKDIR /usr/src/app

# Kopiere die Abhängigkeiten und die Anwendung in das Arbeitsverzeichnis
COPY package*.json ./
COPY index.js .

# Installiere Abhängigkeiten
RUN npm install

# Exponiere den Port, auf dem der Node.js-Server läuft
EXPOSE 3000

# Starte den Node.js-Server
CMD [ "node", "index.js" ]
