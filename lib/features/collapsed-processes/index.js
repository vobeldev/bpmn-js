import CollapsedProcesses from './CollapsedProcesses';
import RemoveDiagramBehavior from './DeleteBehaviour';
import DiagramUtil from './diagramUtil';

export default {
  __depends__: [ ],
  __init__: [ 'collapsedProcesses', 'diagramUtil', 'removeDiagramBehavior' ],
  collapsedProcesses: [ 'type', CollapsedProcesses ],
  diagramUtil: [ 'type', DiagramUtil ],
  removeDiagramBehavior: ['type', RemoveDiagramBehavior]

};