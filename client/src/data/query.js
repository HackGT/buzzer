var queryMessage = `query send_message($message:String!, $plugins:PluginMaster!) {
  send_message(message: $message, plugins: $plugins) {
    plugin
    errors {
      error
      message
    }
  }
}`;

export default (message, clients, plugins) => {
    let clientSchema = clients.map(client => {
        console.log("client:!")
        console.log(client)
        return ({
            [client]: {
                ...plugins
            }
        })
    });
    console.log("schema")
    console.log(clientSchema)
    let clientSchemaJson = {}
    clientSchema.map(client => {
        let index = Object.keys(client)[0];
        clientSchemaJson[index] = client[index];
    })
    console.log(clientSchemaJson)
    return fetch('/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': `application/json`,
                'Accept'      : `application/json`
            },
            body: JSON.stringify({
                query: queryMessage,
                variables: {
                    "message": message,
                    "plugins": clientSchemaJson
                }
            })
        }).then(r =>
            r.json()
        ).then(data => {
            console.log("Success!", data)
            return true;
        })

}
