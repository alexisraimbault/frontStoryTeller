import React, { useState } from 'react';
import * as _ from 'lodash';
import ImageUploading from 'react-images-uploading';
import { serverURL } from '../../statics';

import './styles.scss';

const Uploader = ({ nbMax, updateImages, images }) => {
  const maxNumber = _.isNil(nbMax) ? 1 : nbMax;

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    updateImages(imageList);
  };
  
  return (
    <div className="uploader-wrapper">
    <ImageUploading
      multiple
      value={images}
      onChange={onChange}
      maxNumber={maxNumber}
      dataURLKey="data_url"
    >
      {({
        imageList,
        onImageUpload,
        onImageRemoveAll,
        onImageUpdate,
        onImageRemove,
        isDragging,
        dragProps,
      }) => (
        // write your building UI
        <div className="upload__image-wrapper">
          <button
            style={isDragging ? { color: 'red' } : undefined}
            onClick={onImageUpload}
            {...dragProps}
          >
            Click or Drop here
          </button>
          &nbsp;
          <button onClick={onImageRemoveAll}>Remove all images</button>
          {imageList.map((image, index) => (
            <div key={index} className="image-item">
              {!_.isString(image) && <img src={image['data_url']} alt="" width="100" />}
              {_.isString(image) && <img src={`${serverURL}/file/${image}`} alt="" width="100" />}
              <div className="image-item__btn-wrapper">
                <button onClick={() => onImageUpdate(index)}>Update</button>
                <button onClick={() => onImageRemove(index)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ImageUploading>
  </div>
  )
}

export default Uploader;