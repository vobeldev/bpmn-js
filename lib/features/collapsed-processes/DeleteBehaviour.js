import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../util/ModelUtil';

// import { isExpanded } from '../../../util/DiUtil';
// import { isLabel } from '../../../util/LabelUtil';


export default function RemoveDiagramBehavior(canvas, injector, moddle, modeling, diagramUtil) {

  var removeNestedProcesses = function(process) {
    process.flowElements && process.flowElements.forEach(element => {
      if (is(element, 'bpmn:SubProcess')) {
        removeNestedProcesses(element);
      }
    });

    diagramUtil.removeProcess(process.id);
  };

  injector.invoke(CommandInterceptor, this);

  this.preExecute('shape.delete', function(event) {

    // console.log(event);
    var context = event.context;

    if (is(context.shape, 'bpmn:SubProcess')) {
      removeNestedProcesses(context.shape.businessObject);
    }
  });
}

inherits(RemoveDiagramBehavior, CommandInterceptor);

RemoveDiagramBehavior.$inject = [ 'canvas', 'injector', 'moddle', 'modeling', 'diagramUtil' ];