const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const { makeExecutableSchema } = require('graphql-tools');

// const { PORT } = require('./common');

// import {
//  PORT
// } from "./common";

// export const app = express();
app = express();

app.use(compression());
process.on("unhandledRejection", err => {
  throw err;
});

// Some fake data
const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

// The GraphQL schema in string form
const typeDefs = `
  type Query { books: [Book] }
  type Book { title: String, author: String }
`;

// The resolvers
const resolvers = {
  Query: { books: () => books },
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));


// graphQlRoutes(app);
app.listen(3000, () => {
  console.log(`Buzzer system started on port 3000`);
});
/* 
app.listen(PORT, () => {
  console.log(`Buzzer system started on port ${PORT}`);
});
*/
module.exports = app;
