var queryMessage = `query send_message($message:String!, $plugins:PluginMaster!) {
  send_message(message: $message, plugins: $plugins) {
    plugin
    errors {
      error
      message
    }
  }
}`;

export default (message, client, plugins) => {
    return fetch('http://0.0.0.0:8080/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': `application/json`,
                'Accept'      : `application/json`
            },
            body: JSON.stringify({
                query: queryMessage,
                variables: {
                    "message": message,
                    "plugins": {
                        [client]: {
                            ...plugins
                        }
                    }
                }
            })
        }).then(r =>
            r.json()
        ).then(data => {
            console.log("Success!", data)
            return true;
        })

}
