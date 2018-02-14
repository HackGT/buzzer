FROM node:8-alpine

# Templating from registration repo
RUN apk update && apk add bash
RUN apk add git
RUN npm install npm@"~5.4.0" && rm -rf /usr/local/lib/node_modules && mv node_modules /usr/local/lib

WORKDIR /usr/src/buzzer
COPY . /usr/src/buzzer
RUN npm install
RUN npm run build

RUN apk add tzdata
ENV TZ="/usr/share/zoneinfo/America/New_York"

EXPOSE 3000
CMD ["npm", "start"]
