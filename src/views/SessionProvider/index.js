import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import * as _ from 'lodash';

const SessionContext = createContext({});

const SessionProvider = ({ children }) => {
    
    const [session, setSession] = useState(_.isString(localStorage.getItem('session')) ? JSON.parse(localStorage.getItem('session')) : {});

    useEffect(() => {
        axios.defaults.headers.common['authorization'] = _.get(session, 'token');
    }, [session])

    const updateFunctions = {
        setSession,
    }

    return (
        <SessionContext.Provider
            value={{
                contextObject: {session},
                updateFunctions,
            }}
        >
            {children}
        </SessionContext.Provider>

    );
}

export { SessionContext };
export default SessionProvider;
