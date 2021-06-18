import { domify } from 'min-dom';

var MARKER_HIDDEN = 'djs-element-hidden';

var breadcrumbs = domify('<div class="breadcrumbs" style="position: absolute;top: 10px;left: 100px;">Back to Top</div>');

export default function CollapsedProcesses(eventBus, elementRegistry, overlays, canvas, bpmnReplace) {

  var container = canvas.getContainer();

  container.appendChild(breadcrumbs);

  breadcrumbs.addEventListener('click', () => {
    canvas.getCurrentLayer().classList.add(MARKER_HIDDEN);
    canvas.getLayer('base').classList.remove(MARKER_HIDDEN);
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

    Object.keys(layers).filter(id => id.startsWith('subprocess-'))
      .forEach(key => {
        let layer = canvas.getLayer(key);
        layer.classList.add(MARKER_HIDDEN);
      });


    addOverlays(elementRegistry.getAll());
  });

  eventBus.on('collapsedProcess.open', context => {
    canvas.getCurrentLayer().classList.add(MARKER_HIDDEN);

    console.log(canvas.getLayer('subprocess-' + context.id));
    canvas.getLayer('subprocess-' + context.id).classList.remove(MARKER_HIDDEN);
    canvas.switchLayer('subprocess-' + context.id);
  });
}

CollapsedProcesses.$inject = [ 'eventBus', 'elementRegistry', 'overlays', 'canvas', 'bpmnReplace' ];