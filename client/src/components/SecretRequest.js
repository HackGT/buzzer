import React, { Component } from 'react';
import { Button, Input, Header, Modal } from 'semantic-ui-react'
import './css/index.css';
import cookie from 'react-cookies'
class SecretRequest extends Component {
	constructor(props) {
		super(props)
        var token = cookie.load('BUZZER_TOKEN')
		if(token) {
			props.onCookieSet(token);
		}
        this.state = {
            modal_open: !token
        }
	};

	render() {
        return (
            <div>
            <Button onClick={()=>{this.setState({modal_open: true})}}> Enter Buzzer Token </Button>
                <Modal open={this.state.modal_open}>
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
          modal_open: false
        });
        cookie.save('BUZZER_TOKEN', this.state.token, { path: '/' })
        this.props.onCookieSet(this.state.token)
    }
};

export default SecretRequest;
