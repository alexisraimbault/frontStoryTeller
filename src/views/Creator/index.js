import React, { useState, useEffect, useContext, useRef } from 'react';
import * as _ from 'lodash';
import axios from 'axios';
import { serverURL } from '../../statics';
import { useHistory } from 'react-router-dom';
import { Group } from "@visx/group";
import { Cluster, hierarchy } from "@visx/hierarchy";
import { LinkVertical, LinkVerticalCurve } from "@visx/shape";
import { LinearGradient } from "@visx/gradient";

import Input from '../../kit/Input';
import ActionButton from '../../kit/ActionButton';
import CreateEditPopup from './components/CreateEditPopup';

import './styles.scss';

const citrus = "#ddf163";
const white = "#ffffff";
const green = "#79d259";
const aqua = "#37ac8c";
const merlinsbeard = "#f7f7f3";
const background = "#306c90";
const defaultMargin = { top: 40, left: 20, right: 20, bottom: 40 };

const Creator = ({ props }) => {
    const [popup, setPopup] = useState(null)
    const [pages, setPages] = useState([{
      label: 'Initial label',
      idx: 0,
      type: 'choice',
      choices: [],
      meta: {},
    }]);

    const nodePointsDataMemo = useRef({});
    
    const getTreeFromPages = () => {
      // TODO -> used another solution (keep tree up to date at all times) for better performances
    }

    const [tree, setTree] = useState({idx: 0, children: []});

    // TODO memoize this
    const formatTreeDataRes = (node, parents=[]) => {
      const nodeDetails = _.find(pages, {idx: node.idx});

      if(_.isEmpty(node.children)) {
        return {data: nodeDetails};
      }

      return {
        data: nodeDetails,
        children: _.map(_.filter(node.children, child => !_.includes(parents, child.idx)), child => formatTreeDataRes(child, _.concat(parents, node.idx))),
        backLinks: _.map(_.filter(node.children, child => _.includes(parents, child.idx)), 'idx'),
      };
    }
    
    const onCreatePage = () => () => {
      const newPageIdx = _.size(pages);

      const newPage = {
        label: 'Initial label',
        idx: newPageIdx,
        type: 'choice',
        choices: [],
        meta: {},
      }

      setPages(_.concat(pages, newPage));
      setPopup(
        <CreateEditPopup
          pages={pages}
          pageData={newPage}
          onUpdatePage={updatePage(newPageIdx)}
        />
      );
    };

    const renderCreatePopup = idx => {
    };

    const treeData = formatTreeDataRes(tree);
    console.log('ALEXIS treeData', treeData);

    const margin = _.get(props, 'margin', defaultMargin);
    const width = _.get(props, 'width', window.innerWidth) - 340;
    const height = _.get(props, 'height', window.innerHeight);

    const hierarchyData = hierarchy(treeData);
    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    // useEffect(() => {
    //   data.current = () => hierarchy(treeData);
    // }, [pages, treeData, data]);

    const findChildrenRec = (node, idx) => {
      if(node.idx === idx) {
        return _.get(node, 'children', []);
      }

      return _.flattenDeep(_.map(_.get(node, 'children', []), child => findChildrenRec(child, idx)));
    };

    const findIdxArrayRec = (node, idxArray) => {
      if(_.includes(idxArray, node.idx)) {
        return _.flattenDeep(_.concat(node, _.map(_.get(node, 'children', []), child => findIdxArrayRec(child, idxArray))));
      }

      return _.flattenDeep(_.map(_.get(node, 'children', []), child => findIdxArrayRec(child, idxArray)));
    };

    const updateChildrenInTree = (node, newChildren, idx) => {
      if(node.idx === idx) {
        node.children = newChildren;
        return;
      }

      _.each(_.get(node, 'children', []), child => updateChildrenInTree(child, newChildren, idx));
    };

    const updatePage = idx => newPage => {
      const tmpPages = _.cloneDeep(pages);
      const editingPageIdx = _.findIndex(pages, {idx: idx});
      if(editingPageIdx === -1) {
        tmpPages.push(newPage);
      } else {
        tmpPages[editingPageIdx] = newPage;
      }

      console.log('ALEXIS updatePage', {idx, newPage, tmpPages});

      // Updating the tree
      // -----------------

      const tmpTree = _.cloneDeep(tree);
      // const oldChildren = findChildrenRec(tmpTree, idx);
      // const oldChildrenIdxs = _.map(oldChildren, 'idx');
      const newChildrenIdxs = _.filter(_.map(newPage.choices, 'link'), newIdx => !_.isNil(newIdx) && !_.isNaN(newIdx));

      // const childrenToDetachIdxs = _.difference(oldChildrenIdxs, newChildrenIdxs);
      // const childrenToAddIdxs = _.difference(newChildrenIdxs, oldChildrenIdxs);
      
      const newChildrenInTree = findIdxArrayRec(tmpTree, newChildrenIdxs);
      const newChildrenInTreeIdxs = _.map(newChildrenInTree, 'idx');
      const childrenMissingFromTreeIdxs = _.difference(newChildrenIdxs, newChildrenInTreeIdxs);
      const newChildrenOutsideOfTree = _.map(childrenMissingFromTreeIdxs, outsideIdx => ({
        idx: outsideIdx,
        children: [],
      }));
      const newChildren = _.concat(newChildrenOutsideOfTree, newChildrenInTree);

      updateChildrenInTree(tmpTree, newChildren, idx);
      console.log('ALEXIS updatePage', {tmpTree, newChildrenIdxs, newChildren});

      setPopup(null);
      setTree(tmpTree);
      setPages(tmpPages);
    };

    const renderNode = (node, isRoot = false) => {
      nodePointsDataMemo.current[node.data.data.idx] = node;
      console.log('ALEXIS renderNode', {node, isRoot});
      const isParent = !_.isEmpty(node.children);
      if (isRoot) return renderRootNode(node);

      return (
        <>
          <Group top={node.y} left={node.x}>
            {node.depth !== 0 && (
              <circle
                r={12}
                fill={background}
                stroke={isParent ? white : citrus}
                onClick={() => {
                  setPopup(
                    <CreateEditPopup
                      pages={pages}
                      pageData={_.find(pages, {idx: node.data.data.idx})}
                      onUpdatePage={updatePage(node.data.data.idx)}
                    />
                  );
                }}
              />
            )}
            <text
              dy=".33em"
              fontSize={9}
              fontFamily="Arial"
              textAnchor="middle"
              style={{ pointerEvents: "none" }}
              fill={isParent ? white : citrus}
            >
              {node.data.data.label}
            </text>
          </Group>
          {_.map(_.get(node, 'data.backLinks', []), (linkIdx, i) => (
            <LinkVerticalCurve
              key={`link-back-${i}`}
              data={{
                source: node,
                target: nodePointsDataMemo.current[linkIdx],
              }}
              stroke={merlinsbeard}
              strokeWidth="1"
              strokeOpacity={0.2}
              fill="none"
            />
          ))}
        </>
      );
    }

    const renderRootNode = node => {
      console.log('ALEXIS renderRootNode', {node});
      const width = 40;
      const height = 20;
      const centerX = -width / 2;
      const centerY = -height / 2;
      return (
        <Group top={node.y} left={node.x}>
          <rect
            width={width}
            height={height}
            y={centerY}
            x={centerX}
            fill="url('#top')"
            onClick={() => {
              setPopup(
                <CreateEditPopup
                  pages={pages}
                  pageData={_.find(pages, {idx: node.data.data.idx})}
                  onUpdatePage={updatePage(node.data.data.idx)}
                />
              );
            }}
          />
          <text
            dy=".33em"
            fontSize={9}
            fontFamily="Arial"
            textAnchor="middle"
            style={{ pointerEvents: "none" }}
            fill={background}
          >
            {node.data.data.label}
          </text>
        </Group>
      );
    }

    return (
      <div className="creator-container">
        <div className="pages-container">
          {_.map(pages, page => {

            return (
              <div 
                className="page-container"
                onClick={() => {
                  setPopup(
                    <CreateEditPopup
                      pages={pages}
                      pageData={_.find(pages, {idx: page.idx})}
                      onUpdatePage={updatePage(page.idx)}
                    />
                  );
                }}
              >
                {page.label}
              </div>
            )
          })}
        </div>
        <svg width={width} height={height}>
          <LinearGradient id="top" from={green} to={aqua} />
          <rect width={width} height={height} fill={background} />
          <Cluster root={hierarchyData} size={[xMax, yMax]}>
            {(cluster) => (
              <Group top={margin.top} left={margin.left}>
                {cluster.links().map((link, i) => {
                  console.log('ALEXIS link', link);
                  return (
                    <LinkVertical
                      key={`cluster-link-${i}`}
                      data={link}
                      stroke={merlinsbeard}
                      strokeWidth="1"
                      strokeOpacity={0.2}
                      fill="none"
                    />
                  );
                })}
                {cluster.descendants().map((node, i) => renderNode(node, i === 0))}
              </Group>
            )}
          </Cluster>
        </svg>
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
      </div>
    )
}

export default Creator;