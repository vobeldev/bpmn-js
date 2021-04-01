import inherits from 'inherits';

import {
  forEach
} from 'min-dash';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';


export default function ReplaceRootBehavior(eventBus) {

  CommandInterceptor.call(this, eventBus);

  this.execute('root.replace', function(context) {

    var newRoot = context.newRoot,
        newRootBo = newRoot.businessObject,
        newRootDi = newRootBo.di,
        children = newRoot.children;

    // re-wire DI of children
    forEach(children, function(child) {
      var childBo = child.businessObject,
          childDi = childBo.di;

      childDi.$parent = newRootDi;
    });

  }, true);
}

inherits(ReplaceRootBehavior, CommandInterceptor);

ReplaceRootBehavior.$inject = [
  'eventBus'
];
