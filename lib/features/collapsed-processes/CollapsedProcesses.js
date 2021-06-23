import { domify } from 'min-dom';

var MARKER_HIDDEN = 'djs-element-hidden';
var BASE_LAYER = 'plane-sid-c0e088a1-aae1-4ed2-b939-5371e7cf26ad';
var PLANE_ID = 'sid-9e0f3f83-38fc-45ef-b062-e81f67359940';
var breadcrumbs = domify('<div class="breadcrumbs" style="position: absolute;top: 10px;left: 100px;">Back to Top</div>');

export default function CollapsedProcesses(eventBus, elementRegistry, overlays, canvas, bpmnReplace) {

  window.canvas = canvas;

  let currentLayer = BASE_LAYER;
  var container = canvas.getContainer();

  container.appendChild(breadcrumbs);

  breadcrumbs.addEventListener('click', () => {
    console.log('show base');
    canvas.hideLayer(currentLayer);
    currentLayer = BASE_LAYER;
    canvas.showLayer(BASE_LAYER);
    canvas.switchLayer(BASE_LAYER);

    elementRegistry.getAll().map(el => el.businessObject).forEach(el => {
      console.log(el);
      if (el.dis[PLANE_ID]) {
        console.log(el);
        el.di = el.dis[PLANE_ID];
      }
    });
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
    canvas.switchLayer(BASE_LAYER);
    const layers = canvas.getLayers();
    addOverlays(elementRegistry.getAll());

    Object.keys(layers).filter(id => id.startsWith('plane-'))
      .forEach(key => {
        canvas.hideLayer(key);
      });
    canvas.showLayer(BASE_LAYER);
  });

  eventBus.on('collapsedProcess.open', context => {
    canvas.hideLayer(currentLayer);
    currentLayer = 'plane-' + context.id;
    canvas.showLayer('plane-' + context.id);
    canvas.switchLayer('plane-' + context.id);

    elementRegistry.getAll().map(el => el.businessObject).forEach(el => {
      console.log(el);
      if (el.dis[context.id]) {
        console.log(el);
        el.di = el.dis[context.id];
      }
    });
  });
}

CollapsedProcesses.$inject = [ 'eventBus', 'elementRegistry', 'overlays', 'canvas', 'bpmnReplace' ];