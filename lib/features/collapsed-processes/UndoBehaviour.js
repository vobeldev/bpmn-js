import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

export default function UndoBehaviour(eventBus, injector,) {
  var layer = 'sid-c0e088a1-aae1-4ed2-b939-5371e7cf26ad';

  eventBus.on('collapsedProcess.changeLayer', function(event) {
    layer = event.id;
  });

  injector.invoke(CommandInterceptor, this);

  this.revert(function(event) {
    if (event.context.layer) {
      eventBus.fire('collapsedProcess.changeLayer', { id: event.context.layer });
    }
  });

  this.execute(function(event) {

    if (event.context.layer) {
      eventBus.fire('collapsedProcess.changeLayer', { id: event.context.layer });
    } else {
      event.context.layer = layer;
    }
  });
}

inherits(UndoBehaviour, CommandInterceptor);

UndoBehaviour.$inject = [ 'eventBus', 'injector'];