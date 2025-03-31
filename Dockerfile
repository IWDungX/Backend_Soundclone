FROM node:20
RUN mkdir -p /src/server

WORKDIR /src/server

COPY package.json package-lock.json ./


RUN npm install --silent

EXPOSE 3001

COPY . /src/server

CMD ["npm", "run", "docker"]
