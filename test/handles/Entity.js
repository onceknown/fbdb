'use strict';

const expect = require('expect');
const fbmocks = require('../fbmocks');
const Entity = require('../../handles/Entity');

describe('Entity', () => {

  describe('watch', () => {

    it('subscribes to "value" event on firebase reference', () => {
      let mock = fbmocks.fbMock();
      let handle = new Entity(mock);

      handle.watch();
      expect(mock.on.calls[0].arguments[0]).toBe('value');
    });

    it('does not create new firebase subscription when handle is already watching', () => {
      let mock = fbmocks.fbMock();
      let handle = new Entity(mock);

      handle.watch();
      handle.watch();
      expect(mock.on.calls.length).toBe(1);
    });

    it('emits "change" event on fb "value"', () => {
      let mock = fbmocks.fbEventsMock();
      let data = 'data';
      let handle = new Entity(mock);

      handle.watch();
      handle.on('change', (d) => {
        expect(d).toBe(data);
      });
      mock.emit('value', fbmocks.snapshotMock(data));
    });

    it('emits "disconnect" event on fb "value" cancel', () => {
      let mock = fbmocks.valueMock();
      let handle = new Entity(mock);
      let err = {message: 'error'};

      handle.watch();
      handle.on('disconnect', (err) => {
        expect(err).toBe(err);
      });
      mock.callCanceler(err);

    });

  });

  describe('set', () => {

    it('returns promise');
    it('passes `data` through to `fb.set`');
    it('rejects with errors if validation fails');
    it('rejects with error if `fb.set` fails');
    it('resolves on successful `fb.set`');

  });

  describe('setWithPriority', () => {

    it('returns promise');
    it('passes `data` and `priority` through to `fb.setWithPriority`');
    it('rejects with errors if validation fails');
    it('rejects with error if `fb.set` fails');
    it('resolves on successful `fb.setWithPriority`');

  });

  describe('update', () => {

    it('returns promise');
    it('passes `data through to `fb.update`');
    it('calls `validate` with correctly assigned `newData`');
    it('rejects with errors if validation fails');
    it('rejects with error if `fb.set` fails');
    it('resolves on successful `fb.setWithPriority`');

  });

  describe('remove', () => {

    it('returns promise');
    it('rejects with error if `fb.remove` fails');
    it('resolves on successful `fb.remove`');

  });

  describe('off', () => {

    it('kills firebase subscription if no "change" handlers left and clears data', () => {
      let mock = fbmocks.fbMock();
      let handle = new Entity(mock);
      let handler = handle.on('change', expect.createSpy());

      handle.watch();
      let watcher = handle.watcher;

      handle.off('change', handler);

      expect(mock.off).toHaveBeenCalledWith('value', watcher);
      expect(handle.watcher).toBe(undefined);
      expect(handle.data).toBe(undefined);
    });


    it('keeps firebase subscription if "change" handlers are left', () => {
      let mock = fbmocks.fbMock();
      let handle = new Entity(mock);
      let handler = handle.on('change', expect.createSpy());

      handle.on('change', expect.createSpy());
      handle.watch();

      handle.off('change', handler);

      expect(mock.off.calls.length).toBe(0);
      expect(handle.watcher).toNotBe(null);
    });

  });

});
