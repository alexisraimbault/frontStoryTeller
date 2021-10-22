import React, { Component } from 'react';

import './styles.scss';

class BasicButton extends Component {

    render() {
        const { label, onClick } = this.props;

        return (
            <button className="basic-button" onClick={onClick}>{label}</button>
        );
    }
}

export default BasicButton;