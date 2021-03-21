FROM node:12-alpine

WORKDIR /usr/src/buzzer/
COPY . /usr/src/buzzer/

RUN yarn install
RUN yarn build

EXPOSE 3000
CMD ["yarn", "start"]