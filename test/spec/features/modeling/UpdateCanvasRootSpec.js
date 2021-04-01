import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - update canvas root', function() {

  describe('process', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    var testModules = [ coreModule, modelingModule ];
    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('basics', function() {

      it('should execute', inject(function(modeling, elementFactory) {

        // given
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Process',
          id: 'newRoot'
        });

        // when
        var newRootReturned = modeling.updateRoot(newRoot);

        // then
        expect(newRootReturned).to.exist;
      }));


      it('should return new diagram root', inject(function(canvas, modeling, elementFactory) {

        // given
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Process',
          id: 'newRoot'
        });

        // when
        var newRootReturned = modeling.updateRoot(newRoot);

        // then
        var canvasRoot = canvas.getRootElement();

        expect(canvasRoot).to.equal(newRootReturned);
      }));


      it('should set attrs', inject(function(modeling, elementFactory) {

        // given
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Process',
          id: 'newRoot',
          foo: 'bar'
        });

        // when
        var newRootReturned = modeling.updateRoot(newRoot);

        // then
        expect(newRootReturned.id).to.equal('newRoot');
        expect(newRootReturned.foo).to.equal('bar');
      }));


      it('should generate a new id', inject(function(canvas, modeling, elementFactory) {

        // given
        var oldRoot = canvas.getRootElement();

        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Process'
        });

        // when
        modeling.updateRoot(newRoot);

        // then
        expect(newRoot.id).to.not.equal(oldRoot.id);
      }));


      it('should create DI', inject(function(elementFactory, elementRegistry, modeling) {

        // given
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Process'
        });

        // when
        modeling.updateRoot(newRoot);

        // then
        var newRootBusinessObject = newRoot.businessObject;
        expect(newRootBusinessObject.di).to.exist;
      }));

    });


    describe('undo/redo support', function() {

      it('should undo', inject(function(canvas, elementFactory, modeling, commandStack) {

        // given
        var oldRoot = canvas.getRootElement();
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Process',
          id: 'newRoot'
        });

        modeling.updateRoot(newRoot);

        // when
        commandStack.undo();

        // then
        var root = canvas.getRootElement();

        expect(root).to.equal(oldRoot);

        expect(newRoot.businessObject.di).to.not.exist;
      }));


      it('should redo', inject(function(canvas, elementFactory, modeling, commandStack) {

        // given
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Process',
          id: 'newRoot'
        });

        modeling.updateRoot(newRoot);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var root = canvas.getRootElement();

        expect(root).to.equal(newRoot);

        expect(newRoot.businessObject.di).to.exist;
      }));

    });

  });


  describe('collaboration', function() {

    var diagramXML = require('../../../fixtures/bpmn/collaboration.bpmn');

    var testModules = [ coreModule, modelingModule ];
    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('basics', function() {

      it('should execute', inject(function(modeling, elementFactory) {

        // given
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Collaboration',
          id: 'newRoot'
        });

        // when
        var newRootReturned = modeling.updateRoot(newRoot);

        // then
        expect(newRootReturned).to.exist;
      }));


      it('should return new diagram root', inject(function(canvas, modeling, elementFactory) {

        // given
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Collaboration',
          id: 'newRoot'
        });

        // when
        var newRootReturned = modeling.updateRoot(newRoot);

        // then
        var canvasRoot = canvas.getRootElement();

        expect(canvasRoot).to.equal(newRootReturned);
      }));


      it('should set attrs', inject(function(modeling, elementFactory) {

        // given
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Collaboration',
          id: 'newRoot',
          foo: 'bar'
        });

        // when
        var newRootReturned = modeling.updateRoot(newRoot);

        // then
        expect(newRootReturned.id).to.equal('newRoot');
        expect(newRootReturned.foo).to.equal('bar');
      }));


      it('should generate a new id', inject(function(canvas, modeling, elementFactory) {

        // given
        var oldRoot = canvas.getRootElement();

        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Collaboration'
        });

        // when
        modeling.updateRoot(newRoot);

        // then
        expect(newRoot.id).to.not.equal(oldRoot.id);
      }));


      it('should create DI', inject(function(elementFactory, elementRegistry, modeling) {

        // given
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Collaboration'
        });

        // when
        modeling.updateRoot(newRoot);

        // then
        var newRootBusinessObject = newRoot.businessObject;
        expect(newRootBusinessObject.di).to.exist;
      }));

    });


    describe('undo/redo support', function() {

      it('should undo', inject(function(canvas, elementFactory, modeling, commandStack) {

        // given
        var oldRoot = canvas.getRootElement();
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Collaboration',
          id: 'newRoot'
        });

        modeling.updateRoot(newRoot);

        // when
        commandStack.undo();

        // then
        var root = canvas.getRootElement();

        expect(root).to.equal(oldRoot);

        expect(newRoot.businessObject.di).to.not.exist;
      }));


      it('should redo', inject(function(canvas, elementFactory, modeling, commandStack) {

        // given
        var newRoot = elementFactory.create('root', {
          type: 'bpmn:Collaboration',
          id: 'newRoot'
        });

        modeling.updateRoot(newRoot);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var root = canvas.getRootElement();

        expect(root).to.equal(newRoot);

        expect(newRoot.businessObject.di).to.exist;
      }));

    });

  });

});
