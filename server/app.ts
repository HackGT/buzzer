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
// TODO: Scan for plugins and import both api and typeDefs. API should take message and config.
const app = express();

app.use(compression());
process.on("unhandledRejection", err => {
  throw err;
});

// API suggestions: Use tags and media. Media don't have options (except slack with specified channels). Tags is a PM (through... what platform?) to everyone tagged. - ie Tags is a keyword to send individual messages?

/*
enum Status {
  SUCCESS,
  FAILURE,
  NULL
}
*/

// Do I need to use a promise below?
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
      /*
      async runAPI = () => await Promise.all(src.map( plugin =>
	mediaAPI[plugin.toUpperCase()](args.message,
					args.plugins[plugin])
      ))
      runAPI().then(
	res => {
	  console.log(res)
	  let statusRet: IStatusReturn = {}
	  src.forEach( (srcName, index) => {
	    statusRet[srcName] = res[index]
	  })
	  return statusRet
	})
      */
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
