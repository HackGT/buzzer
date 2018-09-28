FROM node:10-alpine

# Templating from registration repo
RUN apk update && apk add bash git

WORKDIR /usr/src/buzzer
COPY . /usr/src/buzzer
RUN npm install
RUN npm run build
RUN npm test

EXPOSE 3000
CMD ["npm", "start"]