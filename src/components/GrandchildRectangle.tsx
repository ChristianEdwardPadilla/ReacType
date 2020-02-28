import React, { Component } from 'react';
import { Rect, Group } from 'react-konva';
// Konva = JavaScript library for drawing complex canvas graphics using React
import { ComponentsInt, ComponentInt, ChildInt } from '../utils/interfaces';

// ** this file might restrict you from making the child of a component one of its references - prevents circular references
// (no cycle detection here)
// that is guarded against, as far as I can tell, only on lines 138/139 of LeftColExpansionPanel.tsx
// (that component is in desperate need of a rename and a refactor, btw)

interface PropsInt {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  childId: number;
  componentId: number;
  childComponentName: string;
  childComponentId: number;
  width: number;
  height: number;
  title: string;
  focusChild: any;
  components: ComponentsInt;
  draggable: boolean;
  blockSnapSize: number;
  childType: string;
  imageSource: string;
  handleTransform: any;
}

interface StateInt {
  image: any;
}

class GrandchildRectangle extends Component<PropsInt, StateInt> {
  state = {
    image: null
  };

  getComponentColor(componentId: number) {
    const color = this.props.components.find(
      (comp: ComponentInt) => comp.id === componentId
    ).color;
    return color;
  }

  getPseudoChild() {
    return this.props.components.find(
      (comp: ComponentInt) => comp.id === this.props.childComponentId
    );
  }

  setImage = (imageSource: string): void => {
    if (!imageSource) return;
    const image = new window.Image();
    image.src = imageSource;
    if (!image.height) return null;
    this.setState({ image });
  };

  render() {
    const {
      x,
      y,
      scaleX,
      scaleY,
      childId,
      componentId,
      childType,
      childComponentName,
      childComponentId,
      width,
      height,
      focusChild,
      components,
      imageSource
    } = this.props;

    // the Group is responsible for dragging of all children
    // the Rect emits changes to child width and height with help from Transformer
    return (
      <Group
        draggable={false}
        x={x}
        y={y}
        scaleX={scaleX}
        scaleY={scaleY}
        width={width}
        height={height}
      >
        <Rect
          name={`${childId}`}
          x={0}
          y={0}
          childId={childId}
          componentId={componentId}
          childType={childType}
          scaleX={1}
          scaleY={1}
          width={width}
          height={height}
          stroke={
            childType === 'COMP'
              ? this.getComponentColor(childComponentId)
              : '#000000'
          }
          fillPatternImage={
            this.state.image ? this.state.image : this.setImage(imageSource)
          }
          fillPatternScaleX={
            this.state.image ? width / this.state.image.width : 1
          }
          fillPatternScaleY={
            this.state.image ? height / this.state.image.height : 1
          }
          strokeWidth={2}
          strokeScaleEnabled={false}
          draggable={false}
        />
        // The user can arbitrarily nest Rectangles (components) inside one another
        // we need some way to deal with arbitrary nesting... recursion!
        // (ie we'll have GrandchileRectangle call its own createElement() from within its own render())
        // But, what should the base case be? A "leaf" Rectangle, one without children.
        // If the Rectangle we're in has an empty children array, the map call will just return an empty array
        // and recursion will happily stop.
        // (Additionally, we have 'HTML' components for the user to add. The pure HTML components should not
        // have children of their own, so don't bother looking, hence the childType check)
        // TODO: is GrandchildRectangle even required? Maybe this recursion could happen in Rectangle?
        {childType === 'COMP' &&
          components
            .find((comp: ComponentInt) => comp.title === childComponentName)
            .children.filter((child: ChildInt) => child.childId !== -1)
            .map((grandchild: ChildInt, i: number) => (
              // The recursive call itself:
              <GrandchildRectangle
                key={i}
                components={components}
                componentId={componentId}
                childType={grandchild.childType}
                imageSource={
                  grandchild.htmlElement === 'Image' && grandchild.HTMLInfo.Src
                }
                childComponentName={grandchild.componentName}
                childComponentId={grandchild.childComponentId}
                focusChild={focusChild}
                childId={childId}
                // the below size/position scaling was non-trivial to figure out!
                // A given Rectangle needs to be scaled to the size and position of its parent
                // its parent is actually the pseudoChild of this. Terrible naming, I know
                width={
                  grandchild.position.width *
                  (width / this.getPseudoChild().position.width)
                }
                height={
                  grandchild.position.height *
                  (height / this.getPseudoChild().position.height)
                }
                x={
                  (grandchild.position.x - this.getPseudoChild().position.x) *
                  (width / this.getPseudoChild().position.width)
                }
                y={
                  (grandchild.position.y - this.getPseudoChild().position.y) *
                  (height / this.getPseudoChild().position.height)
                }
              />
            ))}
      </Group>
    );
  }
}

export default GrandchildRectangle;
