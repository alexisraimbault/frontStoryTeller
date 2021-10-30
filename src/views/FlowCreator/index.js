import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import * as _ from 'lodash';
import axios from 'axios';
import { serverURL } from '../../statics';

import ReactFlow from 'react-flow-renderer';
import { Handle } from 'react-flow-renderer';

import Input from '../../kit/Input';
import ActionButton from '../../kit/ActionButton';

import CreateLinkPopup from './components/CreateLinkPopup';
import PageNode from './components/PageNode';

import { SessionContext } from '../SessionProvider';

import './styles.scss';


const nodeWidth = 180;
const leftPadding = 20;

const FlowCreator = ({ match }) => {
  const context = useContext(SessionContext);
  const contextData = _.get(context, 'contextObject');
  const session = _.get(contextData, 'session');

  console.log('ALEXIS match',match);
  const [id, setId] = useState(_.get(match, 'params.id'));
  const [popup, setPopup] = useState(null);
  const [idxCpt, setIdxCpt] = useState(0);
  const [pages, setPages] = useState([{
    id: '0',
    type: 'custom',
    data: {
      label: 'first page',
      idx: 0,
      type: 'choice',
      choices: [],
      meta: {},
    },
    position: { x: leftPadding, y: 20 },
  }]);
  const pagesRef = useRef(null);

  const [links, setLinks] = useState([]);

  useEffect(() => {
    const isEditing = !_.isNil(_.get(match, 'params.id'));

    if(isEditing){
      axios.get(`${serverURL}/story`, {
        params: {id: _.parseInt(_.get(match, 'params.id'))},
      }).then(res => {
        if(_.isEmpty(_.get(res, 'data.story'))) {
          setId(null);
        } else  {
          const maxId = _.max(_.map(_.get(res, 'data.story.pages', []), page => _.parseInt(page.id)));

          setIdxCpt(maxId);
          setPages(_.get(res, 'data.story.pages', []));
          setLinks(_.get(res, 'data.story.links', []));
        }
      }).catch(err => {
        setId(null);
      })
    }
  }, []);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages])

  const getNewNodePosition = () => {
    const pagesTopRow = _.filter(pages, page => page.position.y < 100);
    
    let xParser = 0;

    while(_.some(pagesTopRow, page => {
      const leftOfPage = page.position.x;
      const rightOfPage = page.position.x + nodeWidth;

      const leftOfInterval =leftPadding + (xParser * nodeWidth);
      const rightOfInterval = leftPadding + ((xParser + 1) * nodeWidth);

      const isLeftInInterval = leftOfPage >= leftOfInterval && leftOfPage < rightOfInterval;
      const isRightInInterval = rightOfPage > leftOfInterval && rightOfPage <= rightOfInterval;
      
      return isLeftInInterval || isRightInInterval;
    })) {
      xParser ++;
    }

    return {x: leftPadding + (xParser * nodeWidth), y : 20}
  }

  const onSaveStory = () => () => {
    const formatttedContent = {
      pages,
      links,
    }

    axios.defaults.headers.common['authorization'] = _.get(session, 'token');

    if(_.isNil(id)) {
      axios.post(`${serverURL}/story`, {
        content: formatttedContent,
      }).then(res => {
        setId(_.get(res, 'data.id'));
      })
    } else {
      axios.put(`${serverURL}/story`, {
        id: _.parseInt(id),
        content: formatttedContent,
      })
    }
  }

  const onCreatePage = () => () => {
    const newNode =  {
      id: `${idxCpt + 1}`,
      type: 'custom',
      data: {
        label: 'first page',
        idx: idxCpt + 1,
        type: 'choice',
        choices: [],
        meta: {},
      },
      position: getNewNodePosition(),
    }

    setIdxCpt(idxCpt + 1);
    setPages(_.concat(pages, newNode));
  }

  const onNodeDragStop = (event, node) => {
    updatePage(node.data.idx)(node);
  }

  const onConnect = ({ source, target }) => {
    console.log('ALEXIS onConnect', { source, target });
    const sourceIdx = _.findIndex(pages, {id: source});
    const targetIdx = _.findIndex(pages, {id: target});

    if(_.some(pages[sourceIdx].data.choices, choice => choice.idx === pages[targetIdx].data.idx)) {
      console.log('ALEXIS link already exists');
      return;
    }

    setPopup(
      <CreateLinkPopup 
        onSaveLink={addNewLink(sourceIdx, targetIdx)}
        defaultLabel="choice"
      />
    );
  }

  const addNewLink = (sourceIdx, targetIdx) => newLinkName => {
    const tmpPages = _.cloneDeep(pages);
    const newLink = {
      id: `l-${tmpPages[sourceIdx].data.idx}-${tmpPages[targetIdx].data.idx}`, 
      source: tmpPages[sourceIdx].id, 
      target: tmpPages[targetIdx].id,
      label: newLinkName,
    };

    tmpPages[sourceIdx].data.choices.push({
      label: newLinkName,
      idx: tmpPages[targetIdx].data.idx,
    });
    setPages(tmpPages);
    setLinks(_.concat(links, newLink));
    setPopup(null);
  }

  const updatePage = idx => newPage => {
    const tmpPages = _.cloneDeep(pages);
    const pageIdx = _.findIndex(pages, page => page.data.idx === idx);

    tmpPages[pageIdx] = newPage;
    setPages(tmpPages);
  }

  const openEditNodeTitle = () => (idx, currrentLabel, defaultImage) => () => {
    setPopup(
      <CreateLinkPopup 
        onSaveLink={saveNewTitle(idx)}
        defaultLabel={currrentLabel}
        setPopup={setPopup}
        withImageUpload
        defaultImage={defaultImage}
      />
    );
  }

  const saveNewTitle = idx => (newLabel, image) => {
    const tmpPages = _.cloneDeep(pagesRef.current);
    const editingIdx = _.findIndex(pagesRef.current, page => page.data.idx === idx);

    console.log('ALEXIS saveNewTitle', pagesRef.current);
    console.log('ALEXIS saveNewTitle', {image});

    if(!_.isNil(image) && !_.isString(image)) {
      let data = new FormData();
      data.append('attachment', image.file);

      axios({
        url: `${serverURL}/attachment/upload`, 
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': `multipart/form-data`,
        },
        data: data,
      })
        .then((response) => {
          console.log('ALEXIS response', response);
          tmpPages[editingIdx].data.label = newLabel;
          tmpPages[editingIdx].data.images = {default: response.data.path};
          setPages(tmpPages);
          setPopup(null);
        }).catch((error) => {
          //handle error
        });
    }else {
      tmpPages[editingIdx].data.label = newLabel;
      setPages(tmpPages);
      setPopup(null);
    }
  }

  const renderPageNode = props => {

    return (
      <PageNode
        {...props}
        saveNewTitle={saveNewTitle(props.data.idx)}
        openEditNodeTitle={openEditNodeTitle()}
      />
    )
  }

  const nodeTypes = {
    custom: renderPageNode,
  };
  
  console.log('ALEXIS rendering', {pages, links});
  return (
    <div className="flow-container-page" style={{ height: window.innerHeight }}>
      <ReactFlow 
        elements={_.concat(pages, links)} 
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
       />
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
          className="add-page-btn"
          onClick={onCreatePage()}
        >
          +
        </div>
        <div 
          className="save-page-btn"
          onClick={onSaveStory()}
        >
          save
        </div>
    </div>
  )
}

export default FlowCreator;