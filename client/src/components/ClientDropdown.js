import React, { Component } from 'react';
import { Dropdown } from 'semantic-ui-react'
import clientData from '../data/clients'
import './css/ClientConfig.css';
class ClientDropdown extends Component {
	constructor() {
		super()
		this.state = {
		};
	};
	render() {
        return (<Dropdown
            className="dropdownCustom"
            name="droppy"
            compact
            placeholder='Select Client'
            onChange={(e,{value})=>this.props.onClientChange(value)}
            fluid
            multiple
            selection
            options={clientData}
        />)
	};
};

export default ClientDropdown;
