import { domify } from 'min-dom';

var MARKER_HIDDEN = 'djs-element-hidden';

var breadcrumbs = domify('<div class="breadcrumbs" style="position: absolute;top: 10px;left: 100px;">Back to Top</div>');

export default function CollapsedProcesses(eventBus, elementRegistry, overlays, canvas, bpmnReplace) {

  window.canvas = canvas;

  let currentLayer = 'base';
  var container = canvas.getContainer();

  container.appendChild(breadcrumbs);

  breadcrumbs.addEventListener('click', () => {
    canvas.hideLayer(currentLayer);
    currentLayer = 'base';
    canvas.showLayer('base');
    canvas.switchLayer('base');
  });

  const addOverlays = (elements) => {
    elements.forEach(element => {
      if (element.type === 'bpmn:SubProcess' && element.collapsed) {
        let html = document.createElement('button');
        html.innerText = '>';

        html.addEventListener('click', () => {
          eventBus.fire('collapsedProcess.open', { id: element.id });
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
    canvas.switchLayer('base');
    const layers = canvas.getLayers();
    addOverlays(elementRegistry.getAll());

    Object.keys(layers).filter(id => id.startsWith('subprocess-'))
      .forEach(key => {
        canvas.hideLayer(key);
      });


  });

  eventBus.on('collapsedProcess.open', context => {
    canvas.hideLayer(currentLayer);
    currentLayer = 'subprocess-' + context.id;
    canvas.showLayer('subprocess-' + context.id);
    canvas.switchLayer('subprocess-' + context.id);
  });
}

CollapsedProcesses.$inject = [ 'eventBus', 'elementRegistry', 'overlays', 'canvas', 'bpmnReplace' ];