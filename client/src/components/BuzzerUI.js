import React, {Component} from 'react';
import ClientDropdown from './ClientDropdown';
import ClientConfig from './ClientConfig';
import SecretRequest from './SecretRequest';
import clientConfigData from '../data/clientConfigData'
import sendNotification from '../data/query.js'
import {Button, Grid, Input, Confirm, Header} from 'semantic-ui-react'
import './css/index.css';

class BuzzerUI extends Component {
    constructor() {
        super()
        this.state = {
            clients: []
        };
        this.onDataChange = this.onDataChange.bind(this)
        this.onConfigChange = this.onConfigChange.bind(this)
        this.close = this.close.bind(this)
    };

    render() {
        return (<div>
            <SecretRequest onCookieSet={(secret) => {
                    this.setState({buzzer_secret: secret})
                }}/>
            <br/>
            <div className="row">
                <div className="column">
                    <Header as='h1'>Buzzer UI</Header>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <ClientDropdown onClientChange={(value) => {
                            this.setState(prevState => ({
                                clients: [...value]
                            }))
                        }}/>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <Input className="inputCustom" placeholder={"Message"} onChange={(e, {value}) => this.setState({message: value})}/>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <ClientConfig config={clientConfigData || {}} selectedClients={this.state.clients || []} onConfigChange={this.onConfigChange}/>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <Button content="Submit" onClick={(e, {value}) => this.onSendNotification()}/>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <Confirm open={this.state.open} onCancel={this.close} onConfirm={this.close} content={"Message: \"" + this.state.message + "\" sent to " + this.state.clients}/>
                </div>
            </div>
        </div>)
    };

    close() {
        this.setState({open: false})
    }
    onSendNotification() {
        let response = sendNotification(this.state.message, this.state.clients, this.state[this.state.clients], this.state.buzzer_secret)
        this.setState({open: true})
    }
    onDataChange(value, key) {
        this.setState({[key]: value})
    }

    onConfigChange(value, key, clients) {
        console.log(value, key)
        this.setState(prev => ({
            [clients]: {
                ...prev[this.state.clients],
                [key]: value
            }
        }))
    }

};

export default BuzzerUI;
