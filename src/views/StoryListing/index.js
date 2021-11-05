import React, { useState, useEffect, useContext } from 'react';
import * as _ from 'lodash';
import axios from 'axios';
import { serverURL } from '../../statics';
import { useHistory } from 'react-router-dom';

import Input from '../../kit/Input';
import ActionButton from '../../kit/ActionButton';
import CreateLinkPopup from '../FlowCreator/components/CreateLinkPopup';

import { SessionContext } from '../SessionProvider';

import './styles.scss';

const StoryListing = ({ props }) => {
    const context = useContext(SessionContext);
    const contextData = _.get(context, 'contextObject');
    const updateFunctions = _.get(context, 'updateFunctions');
    const history = useHistory();
    const session = _.get(contextData, 'session');

    const [myStories, setMyStories] = useState([]);
    const [popup, setPopup] = useState(null);

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

    const navigateToFlow = storyId => {
        history.push(`flow/${storyId}`, {id: storyId});
    }

    const createStory = () => storyName => {
        const pageLeftPadding = 20;

        axios.defaults.headers.common['authorization'] = _.get(session, 'token');
        axios.post(`${serverURL}/story`, {
          content: {
              pages: [{
                id: '0',
                type: 'custom',
                data: {
                  label: 'first page',
                  idx: 0,
                  type: 'choice',
                  choices: [],
                  meta: {},
                },
                position: { x: pageLeftPadding, y: 20 },
              }],
              links: [],
          },
          name: storyName,
        }).then(res => {
            const id = _.get(res, 'data.id');
            navigateToFlow(id);
        });
    };

    const onCreateStory = () => () => {
    
        setPopup(
          <CreateLinkPopup 
            onSaveLink={createStory()}
            defaultLabel="Nouvelle story"
          />
        );
    };

    console.log('ALEXIS RENDERING story listing');

    return (
        <div className="stories-listing-container">
            <div className="stories-container">
                {_.map(myStories, story => {

                    return (
                        <div 
                            className="story-container"
                            onClick={_.partial(navigateToFlow, story.id)}
                        >
                            {_.isNil(_.get(story, 'name')) ? 'Name not defined' : story.name}
                        </div>
                    )
                })}
            </div>
            {!_.isNil(popup) && (
                <div className="popup-container">
                    <div 
                        onClick={_.partial(setPopup, null)}
                        className="popup-quit"
                    >
                    close popup
                    </div>
                    {popup}
                </div>
            )}
            <div 
                className="add-story-btn"
                onClick={onCreateStory()}
            >
            +
            </div>
        </div>
    );
}

export default StoryListing;