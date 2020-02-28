import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
// ** need to update the material UI imports as several are deprecated **

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Tree from 'react-d3-tree';
import Props from './Props';
import HtmlAttr from './HtmlAttr';
import CodePreview from './CodePreview';
import { isEmpty } from '../utils/index.util';
import { ComponentState, ChildState } from '../types/types';

type Props = {
  focusChild: ChildState;
  components: ComponentState[];
  focusComponent: ComponentState;
  deleteProp: any;
  addProp: any;
  classes: any;
}

type Tree = {
  name: string;
  attributes: { [key: string]: { value: string } };
  children: Tree[];
}

const styles = (theme: any): any => ({
  root: {
    flexGrow: 1,
    height: '100%',
    color: '#fff',
  },
  tabsRoot: {
    borderBottom: '0.5px solid #424242'
  },
  tabsIndicator: {
    backgroundColor: '#1de9b6'
  },
  tabRoot: {
    textTransform: 'initial',
    minWidth: 72,
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing.unit * 4,

    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(','),
    '&:hover': {
      color: '#1de9b6',
      opacity: 1
    },
    '&$tabSelected': {
      color: '#33eb91',
      fontWeight: theme.typography.fontWeightMedium
    },
    '&:focus': {
      color: '#4aedc4'
    }
  },
  tabSelected: {},
  typography: {
    padding: theme.spacing.unit * 3
  },
  padding: {
    padding: `0 ${theme.spacing.unit * 2}px`
  }
});

class RightTabs extends Component<Props> {
  state = {
    value: 0
  };

  componentDidMount() {
    // dynamically center the tree based on the div size
    // const dimensions = this.treeWrapper.getBoundingClientRect();
    // this.setState({
    //   translate: {
    //     x: dimensions.width / 12,
    //     y: dimensions.height / 2.2,
    //   },
    // });
  }

  handleChange = (event: any, value: number) => {
    this.setState({ value });
  };

  generateComponentTree(componentId: number, components: ComponentState[]) {
    if (components.length > 0) {
      const component = components.find(comp => comp.id === componentId);
      const tree = { name: component.title, attributes: {}, children: [] };

      component.children.forEach((child) => {
        if (child.childType === 'COMP') {
          tree.children.push(this.generateComponentTree(child.childComponentId, components));
        } else {
          tree.children.push({
            name: child.componentName,
            attributes: {},
            children: [],
          });
        }
      });
      return tree;
    }
  }

  render() {
    const {
      classes,
      components,
      focusComponent,
      deleteProp,
      addProp,
      focusChild
    } = this.props;
    const { value } = this.state;
    // display count on the tab. user can see without clicking into tab
    const propCount = !isEmpty(focusComponent) && focusComponent.props.length;
    const htmlAttribCount = !isEmpty(focusComponent) && focusComponent.children.filter(child => child.childType === 'HTML')
      .length;

    return (
      <div className={classes.root}>
        <Tabs
          value={value}
          onChange={this.handleChange}
          classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
        >
          <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label="Application Tree"
          />
          <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label="Code Preview"
          />
          <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label={`Component Props ${propCount ? `(${propCount})` : ''} `}
          />
          <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label={`HTML Element Attributes ${
              htmlAttribCount ? `(${htmlAttribCount})` : ''
            } `}
          />
          {/* <Tab
            disableRipple
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label="Component State"
          /> */}
        </Tabs>
          {!isEmpty(focusComponent) && value === 0 && (
            <div
              id="treeWrapper"
              style={{
                width: '100%',
                height: '100%',
              }}
              ref={node => (this.treeWrapper = node)}
            >
              <Tree
                data={[this.generateComponentTree(focusComponent.id, components)]}
                separation={{ siblings: 0.3, nonSiblings: 0.3 }}
                transitionDuration={0}
                translate={this.state.translate}
                styles={{
                  nodes: {
                    node: {
                      name: {
                        fill: '#D3D3D3',
                        stroke: '#D3D3D3',
                        strokeWidth: 1,
                      },
                    },
                    leafNode: {
                      name: {
                        fill: '#D3D3D3',
                        stroke: '#D3D3D3',
                        strokeWidth: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          )}
          {!isEmpty(focusComponent) && value === 1 && (
            <CodePreview 
              focusComponent={focusComponent} 
              components={components} 
            />
          )}
          {!isEmpty(focusComponent) && value === 2 && <Props />}
          {!isEmpty(focusComponent) && value === 3 && focusChild.childType === 'HTML' && <HtmlAttr />}
          {!isEmpty(focusComponent) && value === 3 && focusChild.childType !== 'HTML' && (
              <p>Please select an HTML element to view attributes</p>
          )}
        )}
      </div>
    );
  }
}

export default withStyles(styles)(RightTabs);