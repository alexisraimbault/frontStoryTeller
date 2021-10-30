import React, { useState, useEffect, useContext, useMemo } from 'react';
import * as _ from 'lodash';

import Input from '../../../../kit/Input';
import ActionButton from '../../../../kit/ActionButton';
import Uploader from '../../../../kit/Uploader';

import './styles.scss';

const CreateLinkPopup = ({ onSaveLink, defaultLabel, withImageUpload, defaultImage }) => {
    const [linkName, setLinkName] = useState(defaultLabel);
    const [images, setImages] = useState(_.isNil(defaultImage) ? [] : [defaultImage]);

    const saveLink = () => () => {
      onSaveLink(linkName, _.size(images) > 0 ? images[0] : null);
    }
    const onUpdateLinkName = () => input => {
      setLinkName(input.target.value);
    }

    return (
      <div>
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