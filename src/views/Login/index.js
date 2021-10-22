import React, { useState, useEffect, useContext } from 'react';
import * as _ from 'lodash';
import axios from 'axios';
import { serverURL } from '../../statics';
import { useHistory } from 'react-router-dom';

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
        if(!_.isEmpty(_.get(contextData, 'session'))) {
            history.push('/list')
        }
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

    return (
        <div>
            <Input
                placeholder="mail"
                value={mail}
                onChange={onChangeMail}
            />
            <Input
                placeholder="password"
                value={password}
                onChange={onChangePassword}
            />
            <ActionButton
                label="login"
                onClick={onLogin}
            />
        </div>
    )
}

export default Login;