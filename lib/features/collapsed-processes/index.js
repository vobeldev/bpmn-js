import CollapsedProcesses from './CollapsedProcesses';
import DiagramUtil from './diagramUtil';

export default {
  __depends__: [ ],
  __init__: [ 'collapsedProcesses', 'diagramUtil' ],
  collapsedProcesses: [ 'type', CollapsedProcesses ],
  diagramUtil: [ 'type', DiagramUtil ]
};