'use strict';

const expect = require('expect');
const fbmocks = require('../fbmocks');

const List = require('../../handles/IndexedList');
const Entity = require('../../handles/Entity');

const getEntity = function(items, handles) {
  return function(id) {
    let handle = new Entity(fbmocks.fbMock());

    handle.watch();
    handle.data = items[id];

    handles[id] = handle;

    return handle;
  };
};

describe('handles/IndexedList', () => {

  it('dispatches "change" event after all entity handles have dispatched "change" event');

  describe('watch', () => {

    it('subscribes to "value" events on fb reference', () => {
      let mock = fbmocks.fbMock();
      let handle = new List(mock);

      handle.watch();
      expect(mock.on.calls[0].arguments[0]).toBe('value');
    });

    it('does not create new firebase subscription when handle is already watching', () => {
      let mock = fbmocks.fbMock();
      let handle = new List(mock);

      handle.watch();
      handle.watch();
      expect(mock.on.calls.length).toBe(1);
    });

  });

  describe('off', () => {

    it('kills firebase subscription if no event handlers left, clears data, and emits "unwatched"');

  });

});
