import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import {
  forEach
} from 'min-dash';


describe('features/modeling - replace root', function() {

  describe('process', function() {

    var testModules = [ coreModule, modelingModule ];

    var diagramXML = require('../../../fixtures/bpmn/simple-root-elements.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('basics', function() {

      it('should execute', inject(function(modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Process'
        };

        var process = elementRegistry.get('Process_1');

        // when
        var newRootReturned = modeling.replaceRoot(process, newRootData);

        // then
        expect(newRootReturned).to.exist;
      }));


      it('should return new diagram root', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Process'
        };

        var process = elementRegistry.get('Process_1');

        // when
        var newRootReturned = modeling.replaceRoot(process, newRootData);

        // then
        expect(newRootReturned).to.exist;

        var diagramRoot = canvas.getRootElement();
        expect(diagramRoot).to.equal(newRootReturned);
      }));


      it('should use provided root object', inject(function(canvas, modeling, elementRegistry, elementFactory) {

        // given
        var newRootObject = elementFactory.create('root', {
          type: 'bpmn:Process',
          id: 'foo'
        });

        var process = elementRegistry.get('Process_1');

        // when
        modeling.replaceRoot(process, newRootObject);

        // then
        var diagramRoot = canvas.getRootElement();
        expect(diagramRoot).to.equal(newRootObject);
      }));


      it('should set custom attrs from given object', inject(function(canvas, modeling, elementRegistry, elementFactory) {

        // given
        var newRootObject = elementFactory.create('root', {
          type: 'bpmn:Process',
          id: 'foo',
          foo: 'bar'
        });

        var process = elementRegistry.get('Process_1');

        // when
        modeling.replaceRoot(process, newRootObject);

        // then
        var diagramRoot = canvas.getRootElement();
        expect(diagramRoot.foo).to.equal('bar');
      }));


      it('should set custom attrs from given data', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Process',
          id: 'foo',
          foo: 'bar'
        };

        var process = elementRegistry.get('Process_1');

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var diagramRoot = canvas.getRootElement();
        expect(diagramRoot.foo).to.equal('bar');
      }));


      it('should generate a new id', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Process',
        };

        var process = elementRegistry.get('Process_1');

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var diagramRoot = canvas.getRootElement();
        expect(diagramRoot.id).not.to.equal('Process_1');
      }));


      it('should move children', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Process',
        };

        var process = elementRegistry.get('Process_1'),
            children = process.children.slice();

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var diagramRoot = canvas.getRootElement();

        expect(diagramRoot.children).to.have.length(17);

        forEach(diagramRoot.children, function(child) {
          expect(children).to.contain(child);
        });
      }));


      it('should generate DI', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Process',
        };

        var process = elementRegistry.get('Process_1');

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var diagramRoot = canvas.getRootElement(),
            diagramRootBusinessObject = diagramRoot.businessObject;

        expect(diagramRootBusinessObject.di).to.exist;

        expect(diagramRootBusinessObject.di.bpmnElement).to.equal(diagramRootBusinessObject);
      }));


      it('should re-wire DI of children', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Process',
        };

        var process = elementRegistry.get('Process_1');

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var diagramRoot = canvas.getRootElement(),
            diagramRootBusinessObject = diagramRoot.businessObject;

        var startEvent = elementRegistry.get('StartEvent_1'),
            startEventBusinessObject = startEvent.businessObject;

        expect(diagramRootBusinessObject.di).to.equal(startEventBusinessObject.di.$parent);
      }));


      it('should set DI of old root to null', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Process',
        };

        var process = elementRegistry.get('Process_1');

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var oldRootBusinessObject = process.businessObject,
            oldRootDi = oldRootBusinessObject.di;

        expect(oldRootDi).to.be.null;
      }));

    });


    describe('undo/redo support', function() {

      var root, children, newRoot;

      beforeEach(inject(function(canvas, elementRegistry, modeling) {

        // given
        root = canvas.getRootElement(),
        children = root.children.slice();

        var newRootData = {
          type: 'bpmn:Process',
        };

        var process = elementRegistry.get('Process_1');

        // when
        newRoot = modeling.replaceRoot(process, newRootData);
      }));


      describe('undo', function() {

        it('should execute', inject(function(canvas, commandStack) {

          // when
          commandStack.undo();

          // then
          expect(root).to.equal(canvas.getRootElement());
        }));


        it('should bring-back children', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var undoChildren = root.children;

          expect(undoChildren).to.eql(children);
        }));


        it('should re-set DI', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var rootBo = root.businessObject,
              rootDi = rootBo.di;

          expect(rootDi).to.exist;

          var newRootBo = newRoot.businessObject,
              newRootDi = newRootBo.di;

          expect(newRootDi).to.be.null;
        }));


        it('should re-set DI of children', inject(function(elementRegistry, commandStack) {

          // when
          commandStack.undo();

          // then
          var startEvent = elementRegistry.get('StartEvent_1'),
              startEventBusinessObject = startEvent.businessObject,
              rootBo = root.businessObject,
              rootDi = rootBo.di;

          expect(rootDi).to.equal(startEventBusinessObject.di.$parent);
        }));

      });


      describe('redo', function() {

        it('should execute', inject(function(canvas, commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(newRoot).to.equal(canvas.getRootElement());
        }));


        it('should bring-back children', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var redoChildren = newRoot.children;

          forEach(redoChildren, function(child) {
            expect(children).to.contain(child);
          });
        }));


        it('should re-set DI', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var rootBo = root.businessObject,
              rootDi = rootBo.di;

          expect(rootDi).to.be.null;

          var newRootBo = newRoot.businessObject,
              newRootDi = newRootBo.di;

          expect(newRootDi).to.exist;
        }));


        it('should re-set DI of children', inject(function(elementRegistry, commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var startEvent = elementRegistry.get('StartEvent_1'),
              startEventBusinessObject = startEvent.businessObject,
              newRootBo = newRoot.businessObject,
              newRootDi = newRootBo.di;

          expect(newRootDi).to.equal(startEventBusinessObject.di.$parent);
        }));

      });

    });

  });


  describe('collaboration', function() {

    var testModules = [ coreModule, modelingModule ];

    var diagramXML = require('../../../fixtures/bpmn/collaboration.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('basics', function() {

      it('should execute', inject(function(modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Collaboration'
        };

        var process = elementRegistry.get('_Collaboration_2');

        console.log(process.businessObject.$parent);
        expect(process.businessObject.$parent).to.exist;

        // when
        var newRootReturned = modeling.replaceRoot(process, newRootData);

        // then
        expect(newRootReturned).to.exist;
        console.log(newRootReturned.businessObject.$parent);
        expect(newRootReturned.businessObject.$parent).to.exist;
      }));


      it('should return new diagram root', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Collaboration'
        };

        var process = elementRegistry.get('_Collaboration_2');

        // when
        var newRootReturned = modeling.replaceRoot(process, newRootData);

        // then
        expect(newRootReturned).to.exist;

        var diagramRoot = canvas.getRootElement();
        expect(diagramRoot).to.equal(newRootReturned);
      }));


      it('should use provided root object', inject(function(canvas, modeling, elementRegistry, elementFactory) {

        // given
        var newRootObject = elementFactory.create('root', {
          type: 'bpmn:Collaboration',
          id: 'foo'
        });

        var process = elementRegistry.get('_Collaboration_2');

        // when
        modeling.replaceRoot(process, newRootObject);

        // then
        var diagramRoot = canvas.getRootElement();
        expect(diagramRoot).to.equal(newRootObject);
      }));


      it('should set custom attrs from given object', inject(function(canvas, modeling, elementRegistry, elementFactory) {

        // given
        var newRootObject = elementFactory.create('root', {
          type: 'bpmn:Collaboration',
          id: 'foo',
          foo: 'bar'
        });

        var process = elementRegistry.get('_Collaboration_2');

        // when
        modeling.replaceRoot(process, newRootObject);

        // then
        var diagramRoot = canvas.getRootElement();
        expect(diagramRoot.foo).to.equal('bar');
      }));


      it('should set custom attrs from given data', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Collaboration',
          id: 'foo',
          foo: 'bar'
        };

        var process = elementRegistry.get('_Collaboration_2');

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var diagramRoot = canvas.getRootElement();
        expect(diagramRoot.foo).to.equal('bar');
      }));


      it('should generate a new id', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Collaboration',
        };

        var process = elementRegistry.get('_Collaboration_2');

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var diagramRoot = canvas.getRootElement();
        expect(diagramRoot.id).not.to.equal('Process_1');
      }));


      it('should move children', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Collaboration',
        };

        var process = elementRegistry.get('_Collaboration_2'),
            children = process.children.slice();

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var diagramRoot = canvas.getRootElement();

        expect(diagramRoot.children).to.have.length(2);

        forEach(diagramRoot.children, function(child) {
          expect(children).to.contain(child);
        });
      }));


      it('should generate DI', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Collaboration',
        };

        var process = elementRegistry.get('_Collaboration_2');

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var diagramRoot = canvas.getRootElement(),
            diagramRootBusinessObject = diagramRoot.businessObject;

        expect(diagramRootBusinessObject.di).to.exist;

        expect(diagramRootBusinessObject.di.bpmnElement).to.equal(diagramRootBusinessObject);
      }));


      it('should re-wire DI of children', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Collaboration',
        };

        var process = elementRegistry.get('_Collaboration_2');

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var diagramRoot = canvas.getRootElement(),
            diagramRootBusinessObject = diagramRoot.businessObject;

        var participant = elementRegistry.get('Participant_1'),
            participantBusinessObject = participant.businessObject;

        expect(diagramRootBusinessObject.di).to.equal(participantBusinessObject.di.$parent);
      }));


      it('should set DI of old root to null', inject(function(canvas, modeling, elementRegistry) {

        // given
        var newRootData = {
          type: 'bpmn:Collaboration',
        };

        var process = elementRegistry.get('_Collaboration_2');

        // when
        modeling.replaceRoot(process, newRootData);

        // then
        var oldRootBusinessObject = process.businessObject,
            oldRootDi = oldRootBusinessObject.di;

        expect(oldRootDi).to.be.null;
      }));

    });


    describe('undo/redo support', function() {

      var root, children, newRoot;

      beforeEach(inject(function(canvas, elementRegistry, modeling) {

        // given
        root = canvas.getRootElement(),
        children = root.children.slice();

        var newRootData = {
          type: 'bpmn:Collaboration',
        };

        var process = elementRegistry.get('_Collaboration_2');

        // when
        newRoot = modeling.replaceRoot(process, newRootData);
      }));


      describe('undo', function() {

        it('should execute', inject(function(canvas, commandStack) {

          // Collaboration loses its participants!

          // when
          commandStack.undo();

          // then
          expect(root).to.equal(canvas.getRootElement());
        }));


        it('should bring-back children', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var undoChildren = root.children;

          expect(undoChildren).to.eql(children);
        }));


        it('should re-set DI', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var rootBo = root.businessObject,
              rootDi = rootBo.di;

          expect(rootDi).to.exist;

          var newRootBo = newRoot.businessObject,
              newRootDi = newRootBo.di;

          expect(newRootDi).to.be.null;
        }));


        it('should re-set DI of children', inject(function(elementRegistry, commandStack) {

          // when
          commandStack.undo();

          // then
          var startEvent = elementRegistry.get('StartEvent_1'),
              startEventBusinessObject = startEvent.businessObject,
              rootBo = root.businessObject,
              rootDi = rootBo.di;

          expect(rootDi).to.equal(startEventBusinessObject.di.$parent);
        }));

      });


      describe('redo', function() {

        it('should execute', inject(function(canvas, commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(newRoot).to.equal(canvas.getRootElement());
        }));


        it('should bring-back children', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var redoChildren = newRoot.children;

          forEach(redoChildren, function(child) {
            expect(children).to.contain(child);
          });
        }));


        it('should re-set DI', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var rootBo = root.businessObject,
              rootDi = rootBo.di;

          expect(rootDi).to.be.null;

          var newRootBo = newRoot.businessObject,
              newRootDi = newRootBo.di;

          expect(newRootDi).to.exist;
        }));


        it('should re-set DI of children', inject(function(elementRegistry, commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var startEvent = elementRegistry.get('StartEvent_1'),
              startEventBusinessObject = startEvent.businessObject,
              newRootBo = newRoot.businessObject,
              newRootDi = newRootBo.di;

          expect(newRootDi).to.equal(startEventBusinessObject.di.$parent);
        }));

      });

    });

  });

});
