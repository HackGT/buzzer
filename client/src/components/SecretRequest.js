import React, { Component } from 'react';
import { Button, Input, Header, Modal } from 'semantic-ui-react'
import './css/index.css';
import cookie from 'react-cookies'
class SecretRequest extends Component {
	constructor() {
		super()
        var token = cookie.load('BUZZER_TOKEN')
        this.state = {
            open: !token
        }
	};

	render() {
        return (
            <div>
            <Button onClick={()=>{this.setState({open: true})}}> Enter Buzzer Token </Button>
                <Modal open={this.state.open}>
                    <Modal.Header>Enter Buzzer Secret</Modal.Header>
                    <Modal.Content>
                        <Input className="inputCustom"
                            placeholder={"Buzzer Secret"}
                            onChange={(e,{value})=>this.setState({
                                token: value
                            })}/>
                        <Button content="Submit" onClick={this.handleClick} />
                    </Modal.Content>

                </Modal>
            </div>
        )
    };
    handleClick = () => {
        this.setState({
          open: false
        });
        cookie.save('BUZZER_TOKEN', this.state.token, { path: '/' })
        this.props.onCookieSet(this.state.token)
    }

};


export default SecretRequest;
