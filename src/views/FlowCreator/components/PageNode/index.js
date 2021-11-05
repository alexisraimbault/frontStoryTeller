import React, { useState, useEffect, useContext, useMemo } from 'react';
import * as _ from 'lodash';
import { serverURL } from '../../../../statics';

import { Handle } from 'react-flow-renderer';

import Input from '../../../../kit/Input';
import ActionButton from '../../../../kit/ActionButton';

import './styles.scss';

const PageNode = ({ data, isConnectable, saveNewTitle, openEditNodeTitle }) => {

  return (
    <div 
      className="page-node-container"
    >
      <Handle
        type="target"
        id="a"
        style={{ background: '#555', marginTop: '-13px', marginBottom: '12px' }}
        isConnectable={isConnectable}
      />
      {!_.isNil(_.get(data, 'images.default')) && (
        <div
          className="page-image-preview"
          style={{backgroundImage: `url(${serverURL}/file/${data.images.default})`}}
        />
      )}
      <div>{data.label}</div>
      <ActionButton 
        onClick={openEditNodeTitle(data.idx, data.label, _.get(data, 'images.default'))}
        label="Edit"
      />
      <Handle
        type="source"
        id="b"
        style={{background: '#555', marginBottom: '-13px', marginTop: '12px' }}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default PageNode;