declare var require: any
const fs = require('fs')
const path = require('path')
const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import { makeExecutableSchema } from 'graphql-tools'

import { PORT } from './common'
import * as plugins from './plugins/api'
import { GenericNotifier } from './plugins/api/GenericNotifier'
import { APIReturn } from './plugins/api/APIReturn'

const typeDefs = fs.readFileSync(path.resolve(__dirname, "../api.graphql"), "utf8");

const app = express();

app.use(compression());
process.on("unhandledRejection", err => {
  throw err;
});

type IStatusReturn = { [medium: string]: APIReturn }

const resolvers = {
  Query: {
    send_message: (prev: any, args: any) => {
      let statusRet: IStatusReturn = {}
      const src = Object.keys(args.plugins)
      src.forEach( name => {
	const message = args.message
	const config = { ...args.plugins[name], message }
	const plugin: GenericNotifier = plugins.mediaAPI[name.toUpperCase()]
	statusRet[name] = plugin.sendMessage(config)
      })
      return statusRet
    }
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))


app.listen(PORT, () => {
  console.log(`Buzzer system started on 127.0.0.1:${PORT}`)
})

export default app
