import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../util/ModelUtil';



var HIGH_PRIORITY = 2000;


export default function ExpandBehaviour(commandStack, injector, diagramUtil, canvas, bpmnImporter) {

  injector.invoke(CommandInterceptor, this);

  this.postExecuted([ 'shape.toggleCollapse' ], HIGH_PRIORITY, (event) => {
    const shape = event.context.shape;

    if (!is(shape, 'bpmn:SubProcess')) {
      return;
    }

    if (!shape.collapsed) {

      // expand
      var diagram = diagramUtil.findDiagram(shape.id);


      canvas.removeShape('border-' + shape.id);

      // Add elements to parent diagram
      diagram.plane.planeElement.forEach(di => {
        var childElement = canvas.removeShape(di.bpmnElement.id);
        var bo = childElement.businessObject;
        if (bo.dis[shape.id]) {
          bo.di = bo.dis[shape.id];
        }
        console.log(childElement, bo);
        bpmnImporter.add(bo, shape);
      });


    } else {

      // Collapse

    }
  });
}

inherits(ExpandBehaviour, CommandInterceptor);

ExpandBehaviour.$inject = [ 'commandStack', 'injector', 'diagramUtil', 'canvas', 'bpmnImporter' ];