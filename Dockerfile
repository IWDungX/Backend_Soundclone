FROM node:20

WORKDIR /src/admin

RUN apt update && apt install -y xdg-utils

COPY package.json /src/admin/
COPY package-lock.json /src/admin/

RUN npm ci --silent

COPY . /src/admin

RUN npm run build 

EXPOSE 3000

CMD ["npm", "run", "start"]