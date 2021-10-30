import React, { useState, useEffect, useContext } from 'react';
import * as _ from 'lodash';
import axios from 'axios';
import { serverURL } from '../../statics';
import { useHistory } from 'react-router-dom';

import Input from '../../kit/Input';
import ActionButton from '../../kit/ActionButton';

import { SessionContext } from '../SessionProvider';

import './styles.scss';

const StoryListing = ({ props }) => {
    const context = useContext(SessionContext);
    const contextData = _.get(context, 'contextObject');
    const updateFunctions = _.get(context, 'updateFunctions');
    const history = useHistory();
    const session = _.get(contextData, 'session');

    const [myStories, setMyStories] = useState([]);

    useEffect(() => {
        axios.defaults.headers.common['authorization'] = _.get(session, 'token');
        axios.get(`${serverURL}/story/list`)
        .then(listRes => {
            if (listRes.status === 200){
                setMyStories(_.get(listRes, 'data.stories', []));
            }
            if (listRes.status === 403){
                localStorage.removeItem('session');
                updateFunctions.setSession(undefined);
                history.push('login');
            }
        }).catch(e => {
            localStorage.removeItem('session');
            updateFunctions.setSession(undefined);
            history.push('login');
        });
    }, []);

    return (
        <div>
            
        </div>
    )
}

export default StoryListing;