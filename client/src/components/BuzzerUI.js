import React, { Component } from 'react';
import ClientDropdown from './ClientDropdown';
import ClientConfig from './ClientConfig';
import clientConfigData from '../data/clientConfigData'
import sendNotification from '../data/query.js'
import { Button, Grid, Input, Confirm, Header } from 'semantic-ui-react'
import './css/index.css';

class BuzzerUI extends Component {
	constructor() {
		super()
		this.state = {
			client: ""
		};
        this.onDataChange = this.onDataChange.bind(this)
        this.onConfigChange = this.onConfigChange.bind(this)
        this.close = this.close.bind(this)
	};

	render() {
        return (
            <div>
                <br/>
                <div className="row">
                    <div className="column">
                        <Header as='h1'>Buzzer UI</Header>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <ClientDropdown onClientChange={(value) => {
                                this.setState({
                                    client: value
                                })
                            }}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <Input className="inputCustom"
                            placeholder={"Message"}
                            onChange={(e,{value})=>this.setState({
                                message: value
                            })}/>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                    <ClientConfig config={clientConfigData[this.state.client] || {}}
                    onConfigChange={this.onConfigChange}
                    />
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <Button content="Submit" onClick={(e,{value}) => this.onSendNotification()}/>
                    </div>

                </div>
                <div className="row">
                    <div className="column">
                        <Confirm
                            open={this.state.open}
                            onCancel={this.close}
                            onConfirm={this.close}
                            content={"Message: \"" + this.state.message
                                    + "\" sent to " + this.state.client}
                            />
                    </div>
                </div>
            </div>
        )
    };

    close() {
        this.setState({
            open: false
        })
    }
    onSendNotification() {
        let response = sendNotification(this.state.message, this.state.client, this.state[this.state.client])
        this.setState({
            open: true
        })
    }
    onDataChange(value, key) {
        this.setState({
            [key]: value
        })
    }

    onConfigChange(value, key) {
        console.log(value, key)
        this.setState(prev => ({
            [this.state.client]: {
                ...prev[this.state.client],
                [key]: value
            }
        }))
    }

};


export default BuzzerUI;
