const fs = require('fs')
const path = require('path')
const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import { PORT } from './common';

const typeDefs = fs.readFileSync(path.resolve(__dirname, "../api.graphql"), "utf8");

const app = express();

app.use(compression());
process.on("unhandledRejection", err => {
  throw err;
});

// API suggestions: Use tags and media. Media don't have options (except slack with specified channels). Tags is a PM (through... what platform?) to everyone tagged. - ie Tags is a keyword to send individual messages?

// Temp data

type User = {
  name: string,
  phone: string,
  tags: string[]
}

type Tag = {
  name: string,
  users: string[]
}

/*
enum Medium {
  SLACK,
  MOBILE
}
*/

enum Status {
  SUCCESS,
  FAILURE
}

const users: User[] = [
  {
    name: 'Joel Ye',
    phone: '7187558248',
    tags: ['ALL', 'Student'],
  },
  {
    name: 'John Doe',
    phone: '1234567890',
    tags: ['ALL', 'Mentor']
  },
];

const tags: { [name: string] : Tag }  = {
  'ALL': {
    name: 'ALL',
    users: ['Joel Ye', 'John Doe']
  },
  'Student': {
    name: 'Student',
    users: [],
  },
  'Mentor': {
    name: 'Mentor',
    users: []
  }
}

// Do I need to use a promise below?
type APICallback = (message: string) => string;

// Test api
const slackAPI: APICallback = (message) => {
  console.log("Slacking")
  console.log(`Relaying ${message}`)
  console.log(Status.SUCCESS)
  return 'SUCCESS'; // Status.SUCCESS is just a number...
}


// Enum keyed dictionaries don't appear to be supported yet
// const mediaAPI: { [medium: Medium]: APICallback } = {
const mediaAPI: { [medium: string]: APICallback } = {
  "SLACK": slackAPI,
  "MOBILE": ( message: string ) => 'ERROR'// Status.FAILURE
};


const resolvers = {
  Query: {
    // sendMessage: (message: string, media: Medium[]) => media.map(
    // sendMessage: (prev: any, args: any) => { console.log('resolving sendMessage');return {'message' : args.message} },
    
    sendMessage: (prev: any, args: any) => args.media.map(
	(medium : string) => mediaAPI[medium.toUpperCase()](args.message)
    ),
    user: (name: string) => users.filter(e => e.name === name)[0],
    users: () => users,
    tag: (name: string) => tags[name],
    tags: () => tags.values
  },
  User: {
    tags: (prev: any) => prev.tags.map((tagName:string) => tags[tagName])
  }
  /* ,
  sendMessage: {
    Slack: (prev: any, args: any) => {console.log('helloadfkjl'); return mediaAPI['SLACK'](prev.message)} ,
    Mobile: (prev:any, args: any) => mediaAPI['MOBILE'](prev.message)
  }
  */
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

 
app.listen(PORT, () => {
  console.log(`Buzzer system started on port ${PORT}`);
});

export default app;
