var MARKER_HIDDEN = 'djs-element-hidden';


export default function CollapsedProcesses(eventBus, elementRegistry, overlays, canvas, bpmnReplace) {

  console.log(bpmnReplace);
  console.log(eventBus, elementRegistry, overlays);

  console.log(elementRegistry.getAll());

  const addOverlays = (elements) => {
    elements.forEach(element => {
      if (element.type === 'bpmn:SubProcess') {
        if (!element.collapsed) {
          addOverlays(element.children);
          return;
        }

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
    let root = canvas.getRootElement();
    console.log(root);
    addOverlays(root.children);
  });

  eventBus.on('collapsedProcess.open', context => {
    console.log('open', context);

    let element = elementRegistry.get(context.id);

    console.log(element);

    element.parent.children.forEach(child => {
      if (child.id !== element.id) {
        console.log(element);
        canvas.addMarker(child, MARKER_HIDDEN);
      }
    });

    // element.collapsed = false;

    bpmnReplace.replaceElement(element, {
      type: 'bpmn:SubProcess',
      isExpanded: true
    });

    addOverlays(element.children);
  });
}

CollapsedProcesses.$inject = [ 'eventBus', 'elementRegistry', 'overlays', 'canvas', 'bpmnReplace' ];