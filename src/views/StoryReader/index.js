import React, { useState, useEffect, useRef } from 'react';
import * as _ from 'lodash';
import axios from 'axios';
import { serverURL } from '../../statics';
import { useHistory } from 'react-router-dom';

import Input from '../../kit/Input';
import ActionButton from '../../kit/ActionButton';

import { SessionContext } from '../SessionProvider';

import './styles.scss';

const StoryReader = ({ match }) => {
    const storyId = _.parseInt(_.get(match, 'params.id'));
    
  const [pages, setPages] = useState([]);
  const [links, setLinks] = useState([]);
  const [currentNodeIdx, setCurrentNodeIdx] = useState([]);

    useEffect(() => {
        axios.get(`${serverURL}/story`, {
          params: {id: storyId},
        }).then(res => {
            setPages(_.get(res, 'data.story.pages', []));
            setLinks(_.get(res, 'data.story.links', []));

            const startNodeIdx = _.min(_.map(_.get(res, 'data.story.pages', []), page => page.data.idx));
            setCurrentNodeIdx(startNodeIdx);
        })
    }, []);

    const currentNode = _.find(pages, page => page.data.idx === currentNodeIdx);
    const choicesFromCurrentNode = _.isNil(currentNode) ? null : _.filter(links, link => link.source === currentNode.id);

    const navigateTo = targetId => () => {
        const targetNodeIdx = _.find(pages, page => page.id === targetId).data.idx;
        setCurrentNodeIdx(targetNodeIdx);
    }

    return _.isNil(currentNode) ? null : (
        <div 
            className="story-view-container"
            style={_.isNil(_.get(currentNode, 'data.images.default')) ? {} : {backgroundImage: `url(${serverURL}/file/${currentNode.data.images.default})`}}
        >
            <div className="page-form-wrapper">
                <div className="page-form">
                    <div className="page-label">{currentNode.data.label}</div>
                    <div className="page-choices">
                        {_.map(choicesFromCurrentNode, choice => {


                            return (
                                <div 
                                    className="page-choice"
                                    onClick={navigateTo(choice.target)}
                                >
                                    {choice.label}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StoryReader;