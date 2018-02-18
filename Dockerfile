FROM node:8-alpine

# Templating from registration repo
RUN apk update && apk add bash git && \
    npm install npm@"~5.4.0" && rm -rf /usr/local/lib/node_modules && mv node_modules /usr/local/lib

WORKDIR /usr/src/buzzer
COPY . /usr/src/buzzer
RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]