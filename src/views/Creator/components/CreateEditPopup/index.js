import React, { useState, useEffect, useContext, useMemo } from 'react';
import * as _ from 'lodash';

import Input from '../../../../kit/Input';
import ActionButton from '../../../../kit/ActionButton';

import './styles.scss';

const CreateEditPopup = ({ pageData, onUpdatePage, pages }) => {
    const [page, setPage] = useState(pageData);

    const updatePageLabel = () => input => {
      const tmpPage = _.cloneDeep(page);
      tmpPage.label = input.target.value;

      setPage(tmpPage);
    };

    const updatePageChoiceLabel = idx => input => {
      const tmpPage = _.cloneDeep(page);
      const choiceIdx = _.findIndex(tmpPage.choices, {idx: idx});
      tmpPage.choices[choiceIdx].label = input.target.value;

      setPage(tmpPage);
    };

    const updatePageChoiceLink = idx => input => {
      const tmpPage = _.cloneDeep(page);
      const choiceIdx = _.findIndex(tmpPage.choices, {idx: idx});
      console.log('ALEXIS updatePageChoiceLink', {idx, input, choiceIdx, tmpPage});
      tmpPage.choices[choiceIdx].link = _.parseInt(input.target.value);

      setPage(tmpPage);
    };

    const addChoice = () => {
      const tmpPage = _.cloneDeep(page);
      tmpPage.choices = _.concat(_.get(tmpPage, 'choices', []), {idx: _.size(_.get(tmpPage, 'choices', [])), label: '', link: null});

      setPage(tmpPage);
    }

    return (
      <div>
            <Input
              placeholder="label"
              value={page.label}
              onChange={updatePageLabel()}
            />
            <div className="edit-choices-container">
              {_.map(page.choices, choice => {

                return (
                  <div className="edit-choice-container">
                    <Input
                      placeholder="choice label"
                      value={choice.label}
                      onChange={updatePageChoiceLabel(choice.idx)}
                    />
                    <Input
                      placeholder="choice redirection"
                      value={choice.link}
                      onChange={updatePageChoiceLink(choice.idx)}
                    />
                  </div>
                )
              })}
              <div 
              onClick={addChoice}
              >
                NEW CHOICE
              </div>
            </div>
            <div 
             onClick={_.partial(onUpdatePage, page)}
            >
              SAUVEGARDER
            </div>
        </div>
    )
}

export default CreateEditPopup;