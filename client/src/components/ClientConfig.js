import React, { Component } from 'react';
import { Dropdown, Input, Grid } from 'semantic-ui-react'
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
        let configUI = Object.keys(this.props.config).map(input => {
            switch(config[input]) {
                case "string":
                    return (
                            <Input className="inputCustom" placeholder={input}
                                onChange={(e,{value})=>this.props.onConfigChange(value, input)}/>
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
                            onChange={(e,{value})=>this.props.onConfigChange(value, input)}
                        />
                    )
                case "string-array":
                    return  (
                        <Input className="inputCustom"
                            placeholder={"Input all " + input}
                            onChange={(e,{value})=>this.props.onConfigChange(value.split(","), input)}/>
                    )
                    break;

            }
        })
        return (configUI)
	};
};

export default ClientConfig;
