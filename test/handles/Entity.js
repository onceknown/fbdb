'use strict';

const expect = require('expect');
const fbmocks = require('../fbmocks');
const Entity = require('../../handles/Entity');

describe('handles/Entity', () => {

  class EntitySub extends Entity {
    validate(oldData, newData) {}
  }

  describe('id', () => {

    it('derives id from `fb.key()`', () => {
      let mock = fbmocks.fbMock();
      let handle = new Entity(mock);
      let id = handle.id;

      expect(mock.key).toHaveBeenCalled();
    });

  });

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

    it('emits "disconnect" event on fb "value" cancel', (done) => {
      let mock = fbmocks.valueMock();
      let handle = new Entity(mock);
      let err = {message: 'error'};

      handle.watch();
      handle.on('disconnect', (err) => {
        try {
          expect(err).toBe(err);
          done();
        } catch (e) {
          done(e);
        }
      });
      mock.callCanceler(err);

    });

  });

  describe('set', () => {

    it('returns promise', () => {
      let mock = fbmocks.fbMock(1);
      let handle = new EntitySub(mock);

      expect(handle.set({key: 'value'}) instanceof Promise).toBe(true);
    });

    it('passes `data` through to `fb.set`', (done) => {
      let mock = fbmocks.fbMock();
      let handle = new EntitySub(mock);
      let newVal = {key: 'value'};

      handle.set(newVal)
        .then(() => {
          try {
            expect(mock.set.calls.length).toBe(1);
            expect(mock.set.calls[0].arguments[0]).toBe(newVal);
            done();
          } catch (e) {
            done(e);
          }
        });

      mock.callCallback('set', null);
    });

    it('passes `priority` through to `fb.set` if passed', (done) => {
      let mock = fbmocks.fbMock();
      let handle = new EntitySub(mock);
      let newVal = {key: 'value'};

      handle.set(newVal, 1)
        .then(() => {
          try {
            expect(mock.set.calls.length).toBe(1);
            expect(mock.set.calls[0].arguments[0]).toBe(newVal);
            expect(mock.set.calls[0].arguments[1]).toEqual(1);
            done();
          } catch (e) {
            done(e);
          }
        });

      mock.callCallback('set', null);
    });

    it('rejects with errors if validation fails', (done) => {
      class Sub extends Entity {
        validate(oldData, newData) {
          return error;
        }
      }

      let error = [{message: 'Error'}];
      let mock = fbmocks.fbMock();
      let handle = new Sub(mock);

      handle.set({})
        .catch((err) => {
          try {
            expect(err).toBe(error);
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('rejects with error if `fb.set` fails', (done) => {
      let mock = fbmocks.fbMock();
      let handle = new EntitySub(mock);
      let error = new Error();

      handle.set({key: 'value'})
        .catch((err) => {
          try {
            expect(err).toBe(error);
            done();
          } catch (e) {
            done(e);
          }
        });

      mock.callCallback('set', error);
    });

    it('resolves on successful `fb.set`', (done) => {
      let mock = fbmocks.fbMock();
      let handle = new EntitySub(mock);

      handle.set({key: 'value'})
        .then((err) => {
          try {
            expect(err).toBe(undefined);
            done();
          } catch (e) {
            done(e);
          }
        });

      mock.callCallback('set', null);
    });

  });

  describe('update', () => {

    it('returns promise', () => {
      let mock = fbmocks.fbMock(1);
      let handle = new EntitySub(mock);

      expect(handle.set({key: 'value'}) instanceof Promise).toBe(true);
    });

    it('passes `data through to `fb.update`', (done) => {
      let mock = fbmocks.fbMock();
      let handle = new EntitySub(mock);
      let newVal = {key: 'value'};

      handle.update(newVal)
        .then(() => {
          try {
            expect(mock.update.calls.length).toBe(1);
            expect(mock.update.calls[0].arguments[0]).toBe(newVal);
            done();
          } catch (e) {
            done(e);
          }
        });

      mock.callCallback('update', null);
    });

    it('calls `validate` with correctly assigned `newData`', (done) => {
      let mock = fbmocks.fbMock();
      let handle = new EntitySub(mock);
      let existingVal = {data: 2};
      let newVal = {key: 'value', data: 1};

      expect.spyOn(handle, 'validate').andCallThrough();

      handle.data = existingVal;
      handle.update(newVal)
        .then(() => {
          try {
            expect(handle.validate.calls.length).toBe(1);
            expect(handle.validate.calls[0].arguments[0]).toBe(existingVal);
            expect(handle.validate.calls[0].arguments[1]).toEqual({key: 'value', data: 1});
            done();
          } catch (e) {
            done(e);
          }

        });

      mock.callCallback('update', null);
    });

    it('rejects with errors if validation fails', (done) => {
      class Sub extends Entity {
        validate(oldData, newData) {
          return error;
        }
      }

      let error = [{message: 'Error'}];
      let mock = fbmocks.fbMock();
      let handle = new Sub(mock);

      handle.update({key: 'value'})
        .catch((err) => {
          try {
            expect(err).toBe(error);
            done();
          } catch (e) {
            done(e);
          }
        });

    });

    it('rejects with error if `fb.set` fails', (done) => {
      let mock = fbmocks.fbMock();
      let handle = new EntitySub(mock);
      let error = new Error();

      handle.update({key: 'value'})
        .catch((err) => {
          try {
            expect(err).toBe(error);
            done();
          } catch (e) {
            done(e);
          }
        });

      mock.callCallback('update', error);
    });

    it('resolves on successful `fb.update`', (done) => {
      let mock = fbmocks.fbMock();
      let handle = new EntitySub(mock);

      handle.update({key: 'value'})
        .then((err) => {
          try {
            expect(err).toBe(undefined);
            done();
          } catch (e) {
            done(e);
          }
        });

      mock.callCallback('update', null);
    });

  });

  describe('remove', () => {

    it('returns promise', () => {
      let mock = fbmocks.fbMock(1);
      let handle = new EntitySub(mock);

      expect(handle.remove() instanceof Promise).toBe(true);
    });

    it('rejects with error if `fb.remove` fails', (done) => {
      let mock = fbmocks.fbMock();
      let handle = new EntitySub(mock);
      let error = new Error();

      handle.remove()
        .catch((err) => {
          try {
            expect(err).toBe(error);
            done();
          } catch (e) {
            done(e);
          }
        });

      mock.callCallback('remove', error);
    });

    it('resolves on successful `fb.remove`', (done) => {
      let mock = fbmocks.fbMock();
      let handle = new EntitySub(mock);

      handle.remove()
        .then((err) => {
          try {
            expect(err).toBe(undefined);
            done();
          } catch (e) {
            done(e);
          }
        });

      mock.callCallback('remove', null);
    });

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
