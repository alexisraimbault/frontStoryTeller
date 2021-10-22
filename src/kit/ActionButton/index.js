import React, { Component } from 'react';

import './styles.scss';

class ActionButton extends Component {

    render() {
        const { label, onClick } = this.props;

        return (
            <button className="action-button" onClick={onClick}>{label}</button>
        );
    }
}

export default ActionButton;