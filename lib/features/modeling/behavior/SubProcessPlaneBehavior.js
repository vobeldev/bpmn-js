import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { isExpanded } from '../../../util/DiUtil';
import { getBusinessObject, is } from '../../../util/ModelUtil';


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

    // TODO(nikku): how does this relate to our
    // import logic where we explicitly allow only
    // a single diagram to be shown (no drilldown)?
    //
    // here we do create nested plane elements forcefully,
    // while during import these got ignored
    var businessObject = getBusinessObject(shape);

    var di = bpmnFactory.create('bpmndi:BPMNPlane', {
      bpmnElement: businessObject
    });

    // TODO(nikku): BpmnImporter must wire this appropriately,
    // i.e. add plane elements to the BPMN diagram and wrap
    // them into a bpmndi:BPMNDiagram

    // add a virtual element (not being drawn),
    // a copy cat of our BpmnImporter code
    var planeElement = elementFactory.createRoot({
      id: shape.id + '_plane',
      type: businessObject.$type,
      di: di,
      businessObject: businessObject,
      collapsed: true
    });

    canvas.createPlane(shape.id, planeElement);
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
}

SubProcessPlaneBehavior.$inject = [
  'canvas',
  'eventBus',
  'modeling',
  'elementFactory',
  'bpmnFactory'
];

inherits(SubProcessPlaneBehavior, CommandInterceptor);