import CollapsedProcesses from './CollapsedProcesses';
import RemoveDiagramBehavior from './DeleteBehaviour';
import DiagramUtil from './diagramUtil';
import ExpandBehaviour from './ExpandBehaviour';
import UndoBehaviour from './UndoBehaviour';

export default {
  __depends__: [ ],
  __init__: [ 'collapsedProcesses', 'diagramUtil', 'removeDiagramBehavior', 'undoBehaviour', 'expandBehaviour' ],
  collapsedProcesses: [ 'type', CollapsedProcesses ],
  diagramUtil: [ 'type', DiagramUtil ],
  removeDiagramBehavior: ['type', RemoveDiagramBehavior],
  undoBehaviour: ['type', UndoBehaviour],
  expandBehaviour: ['type', ExpandBehaviour]
};