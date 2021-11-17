import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { isExpanded } from '../../../util/DiUtil';
import { getBusinessObject, is } from '../../../util/ModelUtil';
import { forEach } from 'min-dash';


// TODO(nikku): test this!

/**
 * Behavior implementing the creation and deletion
 * of sub-process planes
 *
 * @param {Canvas} canvas
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {ElementFactory} elementFactory
 * @param {BpmnFactory} bpmnFactory
 */
export default function SubProcessPlaneBehavior(
    canvas, eventBus, modeling,
    elementFactory, bpmnFactory) {

  CommandInterceptor.call(this, eventBus);

  function isCollapsedSubProcess(element) {
    return is(element, 'bpmn:SubProcess') && !isExpanded(element);
  }

  // add plane elements for newly created sub-processes
  // this ensures we can actually drill down into the element
  this.postExecute('shape.create', 500, function(context) {
    var shape = context.shape;

    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    var businessObject = getBusinessObject(shape);

    createPlaneElement(businessObject);
  }, true);

  this.postExecute('shape.toggleCollapse', 400, function(context) {
    var shape = context.shape;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    console.log(shape);

    var businessObject = getBusinessObject(shape);


    if (!isExpanded(shape)) {

      // collapsed
      var planeElement = createPlaneElement(businessObject);
      moveChildrenToShape(shape, planeElement);
    } else {

      var plane = canvas.getPlane(shape.id);
      moveChildrenToShape(plane.rootElement, shape);
      canvas.removePlane(plane);
    }
  }, true);


  // TODO(nikku): move elements to plane when collapsing expanded
  // sub-process with existing children

  // ensure we re-wire planes as element IDs change
  // otherwise our assumption of plane#name => subProcess#id
  // breaks
  this.postExecute('element.updateProperties', function(context) {

    var properties = context.properties;
    var oldProperties = context.oldProperties;

    var oldId = oldProperties.id;

    if (!oldId || !canvas._planes[oldId]) {
      return;
    }

    var newId = properties.id;

    canvas._planes[newId] = canvas._planes[oldId];
    canvas._planes[newId].name = newId;

    delete canvas._planes[oldId];
  }, true);

  // remove plane and child elements on deletion
  this.postExecute('shape.delete', function(context) {
    var shape = context.shape;

    if (!isCollapsedSubProcess(shape)) {
      return;
    }

    // TODO(nikku): implement
    //
    // * remove referenced plane element
    // * remove shapes on these plane elements

    // TODO(nikku): how does this interact with
    // single diagram imports (cf. above)?
  }, true);

  // TODO(nikku): make un-doable

  // TODO(nikku): navigate out of plane if plane gets deleted,
  // i.e. via UNDO)
  // already handled globally in diagram-js


  /**
   * Creates a new plane element for the given sub process and
   * adds it to the canvas.
   *
   * @param {Object} businessObject
   */
  function createPlaneElement(businessObject) {

    // TODO(nikku): how does this relate to our
    // import logic where we explicitly allow only
    // a single diagram to be shown (no drilldown)?
    //
    // here we do create nested plane elements forcefully,
    // while during import these got ignored

    var di = bpmnFactory.create('bpmndi:BPMNPlane', {
      bpmnElement: businessObject
    });

    // TODO(nikku): BpmnImporter must wire this appropriately,
    // i.e. add plane elements to the BPMN diagram and wrap
    // them into a bpmndi:BPMNDiagram

    // add a virtual element (not being drawn),
    // a copy cat of our BpmnImporter code
    var planeElement = elementFactory.createRoot({
      id: businessObject.id + '_plane',
      type: businessObject.$type,
      di: di,
      businessObject: businessObject,
      collapsed: true
    });

    canvas.createPlane(businessObject.id, planeElement);

    return planeElement;
  }

  /**
   * Move all child elements of a given shape into a plane.
   *
   * @param {djs.model.Shape} source
   * @param {djs.model.Shape} target
   */
  function moveChildrenToShape(source, target) {
    var children = source.children;

    var offset = {
      x: source.x || 0 - target.x || 0,
      y: source.y || 0 - target.y || 0
    };


    if (!children) {
      return;
    }

    var immutableChildren = children.slice();

    immutableChildren.forEach(function(child) {
      if (child.waypoints) {
        canvas.removeConnection(child);
        canvas.addConnection(child, target);
      } else {
        canvas.removeShape(child);
        canvas.addShape(child, target);
      }
    });

    var visibleElements = moveRecursively(immutableChildren, offset);

    eventBus.fire('elements.changed', { elements: visibleElements });
  }
}

SubProcessPlaneBehavior.$inject = [
  'canvas',
  'eventBus',
  'modeling',
  'elementFactory',
  'bpmnFactory'
];

inherits(SubProcessPlaneBehavior, CommandInterceptor);


function moveRecursively(elements, offset, hidden) {
  var result = [];
  forEach(elements, function(element) {
    if (element.waypoints) {
      forEach(element.waypoints, function(waypoint) {
        waypoint.x -= offset.x;
        waypoint.y -= offset.y;
      });
    } else {
      element.x -= offset.x;
      element.y -= offset.y;
    }


    element.hidden = hidden;

    result = result.concat(element);

    if (element.children) {
      result = result.concat(moveRecursively(element.children, offset, element.collapsed || hidden));
    }
  });

  return result;
}