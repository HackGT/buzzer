# Buzzer

Buzzer is HackGT's notification system. It works on the basis of plugins, where each plugin represents a different platform that a notification can be sent on.

## Plugins
- FCM
  - Send push notifications to mobile devices
- LiveSite
  - Send alerts to users on live site
- MapGT
  - Send popups to users on MapGT via web sockets
- Slack
  - Send announcements to slack channels via Beardell Bot or a user
- Twilio
  - Send text notifications to individual phone numbers or registration user groups
- Twitter
  - Post a tweet on HackGT Twitter

## Getting Started
1. `yarn install`
2. `yarn dev`

## How to Use
Buzzer works via GraphQL APIs and you can send messages via the GraphQL playground and view docs at `/graphiql`. The GraphQL endpoint is `/graphql`.

Additionally, all messages, whether successful or errored out, will be logged to a MongoDB collection with the appropriate config and message used alongside. You can view the logs via a GraphQL query.