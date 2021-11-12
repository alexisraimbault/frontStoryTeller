import React, { useState, useEffect, useContext, useMemo } from 'react';
import * as _ from 'lodash';

import Input from '../../../../kit/Input';
import ActionButton from '../../../../kit/ActionButton';
import Uploader from '../../../../kit/Uploader';

import './styles.scss';

const CreateLinkPopup = ({ onSaveLink, defaultLabel, withImageUpload, defaultImage, popupTitle, popupSubTitle }) => {
    const [linkName, setLinkName] = useState(defaultLabel);
    const [images, setImages] = useState(_.isNil(defaultImage) ? [] : [defaultImage]);

    const saveLink = () => () => {
      onSaveLink(linkName, _.size(images) > 0 ? images[0] : null);
    }
    const onUpdateLinkName = () => input => {
      setLinkName(input.target.value);
    }

    return (
      <div className="popup-wrapper">
        {!_.isEmpty(popupTitle) && <div className="popup-title">{popupTitle}</div>}
        {!_.isEmpty(popupSubTitle) && <div className="popup-subtitle">{popupSubTitle}</div>}
        <Input
          placeholder="label"
          value={linkName}
          onChange={onUpdateLinkName()}
        />
        {withImageUpload && (
          <Uploader 
            updateImages={setImages}
            images={images}
          />
        )}
        <ActionButton 
          onClick={saveLink()}
          label="Save"
        />
      </div>
    )
}

export default CreateLinkPopup;