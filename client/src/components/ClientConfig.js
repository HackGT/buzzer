import React, { Component } from 'react';
import { Dropdown, Input, Grid, Header } from 'semantic-ui-react'
import clientData from '../data/clients'
import './css/ClientConfig.css';
class ClientConfig extends Component {
	constructor() {
		super()
		this.state = {
		};
	};
	render() {
        let config = this.props.config
        let combinedConfigUI =
        this.props.selectedClients.map(client => {
            return (
                <div>
                <Header as='h3'>{
                        client.charAt(0).toUpperCase() + client.slice(1).replace("_","")}
                </Header>
                {Object.keys(this.props.config[client]).map(input => {
                    switch(config[client][input]) {
                        case "string":
                            return (
                                    <Input className="inputCustom" placeholder={input}
                                    onChange={(e,{value})=>this.props.onConfigChange(value, input, client)}/>
                            )
                            break;
                        case "boolean":
                            return (
                                <Dropdown
                                    placeholder= {"" + input}
                                    className="dropdownCustom"
                                    compact
                                    fluid
                                    selection
                                    options={[
                                        {
                                            key: "0",
                                            text: "True",
                                            value: true
                                        },
                                        {
                                            key: "1",
                                            text: "False",
                                            value: false
                                        }
                                    ]}
                                    onChange={(e,{value})=>this.props.onConfigChange(value, input, client)}
                                />
                            )
                        case "string-array":
                            return  (
                                <Input className="inputCustom"
                                    placeholder={"Input all " + input}
                                    onChange={(e,{value})=> this.props.onConfigChange(value.split(","), input, client)}/>
                            )
                            break;
                    }
                })}
            </div>
            )
        })
        console.log(combinedConfigUI)
        return (
            <div>
                {combinedConfigUI}
            </div>
        )
	};
};

export default ClientConfig;
