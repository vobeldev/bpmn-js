import { domify } from 'min-dom';
import {
  assign
} from 'min-dash';


var BASE_LAYER = 'sid-c0e088a1-aae1-4ed2-b939-5371e7cf26ad';
var breadcrumbs = domify('<div class="breadcrumbs" style="position: absolute;top: 10px;left: 100px;">Back to Top</div>');

function elementData(semantic, attrs) {
  return assign({
    id: semantic.id,
    type: semantic.$type,
    businessObject: semantic
  }, attrs);
}

export default function CollapsedProcesses(eventBus, elementRegistry, elementFactory, overlays, canvas, bpmnReplace, diagramUtil, commandStack) {
  window.canvas = canvas;

  let currentLayer = BASE_LAYER;
  var container = canvas.getContainer();

  container.appendChild(breadcrumbs);

  breadcrumbs.addEventListener('click', () => {
    eventBus.fire('collapsedProcess.changeLayer', { id: BASE_LAYER });
  });

  const addOverlays = (elements) => {
    elements.forEach(element => {
      if (element.type === 'bpmn:SubProcess' && element.collapsed) {
        let html = document.createElement('button');
        html.innerText = '>';

        html.addEventListener('click', () => {
          eventBus.fire('collapsedProcess.open', { id: element.id, element: element });
        });


        overlays.add(element, {
          position: {
            right: 0,
            bottom: 0
          },
          html
        });
      }
    });
  };



  eventBus.on('import.done', function(context) {

    // canvas.switchLayer('plane-' + BASE_LAYER);
    const layers = canvas.getLayers();
    addOverlays(elementRegistry.getAll());

    Object.keys(layers).filter(id => id.startsWith('plane-'))
      .forEach(key => {
        canvas.hideLayer(key);
      });

    eventBus.fire('collapsedProcess.changeLayer', { id: BASE_LAYER });

  });

  function addLayer(process) {
    var bo = process.businessObject;
    const newDiagram = diagramUtil.createDiagram(bo);
    diagramUtil.getDiagrams().push(newDiagram);

    bo.dis[process.id] = newDiagram.plane;

    canvas.switchLayer('plane-' + process.id);

    // add a virtual element (not being drawn)
    var element = elementFactory.createRoot(elementData(process.businessObject));
    element.id = 'shadow-' + element.id;

    canvas.setRootElement(element);
  }

  eventBus.on('collapsedProcess.open', context => {
    const bo = context.element.businessObject;

    if (!Object.values(bo.dis).filter(di => di.$type === 'bpmndi:BPMNPlane').length) {
      addLayer(context.element);
    }

    eventBus.fire('collapsedProcess.changeLayer', { id: context.id });
  });

  eventBus.on('collapsedProcess.changeLayer', context => {
    canvas.hideLayer(currentLayer);
    currentLayer = 'plane-' + context.id;
    canvas.showLayer('plane-' + context.id);
    canvas.switchLayer('plane-' + context.id);

    elementRegistry.getAll().map(el => el.businessObject).forEach(el => {
      if (el && el.dis && el.dis[context.id]) {
        el.di = el.dis[context.id];
      }
    });
  });
}

CollapsedProcesses.$inject = [ 'eventBus', 'elementRegistry', 'elementFactory', 'overlays', 'canvas', 'bpmnReplace', 'diagramUtil', 'commandStack' ];