import React, { useState, useEffect, useContext } from 'react';
import * as _ from 'lodash';
import axios from 'axios';
import { serverURL } from '../../statics';
import { useHistory } from 'react-router-dom';

import ReactFlow, { Background } from 'react-flow-renderer';
import { Handle } from 'react-flow-renderer';

import Input from '../../kit/Input';
import ActionButton from '../../kit/ActionButton';

import { SessionContext } from '../SessionProvider';

import './styles.scss';

const Login = ({ props }) => {
    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');

    const context = useContext(SessionContext);
    const contextData = _.get(context, 'contextObject');
    const updateFunctions = _.get(context, 'updateFunctions');
    const history = useHistory();

    useEffect(() => {
        // if(!_.isEmpty(_.get(contextData, 'session'))) {
        //     history.push('/list')
        // }
    }, [])

    const onChangeMail = input => {
        setMail(input.target.value);
    }

    const onChangePassword = input => {
        setPassword(input.target.value)
    }

    const onLogin = () => {
        axios.get(`${serverURL}/user/login`, {
            params: { email: mail, password },
        }).then(loginRes => {
            if (loginRes.status === 200) {
                localStorage.setItem('session', JSON.stringify(loginRes.data));
                updateFunctions.setSession(loginRes.data);
                history.push('/list');
            }
        });
    }

    const renderPageNode = ({data}) => {

    return (
        <div 
          className="node-example-container"
        >
            <Handle
                type="target"
                id="a"
                style={{ background: '#555', marginTop: '-25px', marginBottom: '24px' }}
            />
            <div className="node-title-container">{data.label}</div>
            <Handle
                type="source"
                id="b"
                style={{background: '#555', marginBottom: '-25px', marginTop: '24px' }}
            />
        </div>
    )
    }

    const nodeTypes = {
        custom: renderPageNode,
    };

    return (
        <div className="login-page-container">
            <div className="flow-example-container">
                <ReactFlow 
                    elements={[]} 
                    nodeTypes={nodeTypes}
                    snapToGrid
                >
                    <Background />
                </ReactFlow>
            </div>
            <div className="login-page-infos-container">
                <div className="title">Flow Editor</div>
                <div className="subtitle">L'outil de création de flow le plus simple et complet</div>
            </div>
            <div className="login-form-container">
                <Input
                    placeholder="Mail"
                    value={mail}
                    onChange={onChangeMail}
                />
                <Input
                    placeholder="Password"
                    value={password}
                    onChange={onChangePassword}
                />
                <ActionButton
                    label="login"
                    onClick={onLogin}
                />
            </div>
        </div>
    )
}

export default Login;