FROM node:10-alpine
ENV TZ="America/New_York"
# Templating from registration repo
RUN apk update && apk add bash git

WORKDIR /usr/src/buzzer
COPY . /usr/src/buzzer
RUN npm install
RUN npm run build
RUN npm test

EXPOSE 3000
CMD ["npm", "start"]



# Build container
FROM node:12-alpine AS build

WORKDIR /usr/src/buzzer/
COPY . /usr/src/buzzer/

RUN yarn install && yarn build

# Runtime container
FROM node:12-alpine

COPY --from=build /usr/src/piranha/server/ /usr/src/piranha/server/
COPY --from=build /usr/src/piranha/client/ /usr/src/piranha/client/

WORKDIR /usr/src/piranha/server/

EXPOSE 3000
CMD ["yarn", "start"]
