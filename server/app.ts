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
type APICallback = (message: string, config: any) => string;
type IStatusReturn = { [medium: string]: string }

// Test api
const slackAPI: APICallback = ( message, config ) => {
  console.log("Slacking")
  console.log(`Relaying ${message}`)
  console.log(config)
  return 'SUCCESS'; // Status.SUCCESS is just a number...
}

const liveSiteAPI: APICallback = ( message, config ) => {
  console.log("Live Site")
  console.log(`Relaying ${message}`)
  console.log(config)
  return `SUCCESS`;
}


const mediaAPI: { [medium: string]: APICallback } = {
  "LIVE_SITE": liveSiteAPI,
  "SLACK": slackAPI,
  "EMAIL": ( message: string ) => 'ERROR'// Status.FAILURE
}

const resolvers = {
  Query: {
    send_message: (prev: any, args: any) => {
      let statusRet: IStatusReturn = {}
      const src = Object.keys(args.plugins)
      src.forEach( plugin => {
	const pluginFunc = args.plugins[plugin]
	statusRet[plugin] =
	  mediaAPI[plugin.toUpperCase()](args.message, pluginFunc)
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
  console.log(`Buzzer system started on port ${PORT}`)
  console.log(plugins);
  for (let plugin of plugins.plugins) {
    let curNotifier : GenericNotifier = new plugin()
    console.log(curNotifier.TAG);
    if (curNotifier.TAG === "LIVESITE") {
      curNotifier.sendMessage({message: "yeeee", groups: ["ye1", "ye2"]});
    } else if (curNotifier.TAG === "SLACK") {
      curNotifier.sendMessage({message: "yeeee", groups: ["ye1", "ye2"], channel: "h4ck3r5"});
    }
  }
})

export default app
