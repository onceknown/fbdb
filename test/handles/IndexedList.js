'use strict';

const expect = require('expect');
const fbmocks = require('../fbmocks');

const List = require('../../handles/IndexedList');
const Entity = require('../../handles/Entity');
const Handle = require('../../Handle');

const getEntity = function(items, handles) {
  return function(id) {
    let handle = new Handle();

    handle.data = items[id];
    handles[id] = handle;

    process.nextTick(() => {
      handle.emit('change', handle.data);
    });
    return handle;
  };
};

describe('handles/IndexedList', () => {

  it('dispatches "change" event after all entity handles have dispatched "change" event', (done) => {
    let mock = fbmocks.fbMock();
    let changeSpy = expect.createSpy();
    let handle = new List(mock);
    let listItems = {
      '1': {
        name: 'one'
      },
      '2': {
        name: 'two'
      },
      '3': {
        name: 'three'
      }
    };
    let handles = {};

    handle.getEntity = getEntity(listItems, handles);
    handle.watch();

    mock.callEvent('on', 'value', fbmocks.snapshotMock(['1', '2', '3'], '1'));
    handle.once('change', (data) => {
      expect(data.length).toBe(3);
      expect(data.map(h => h.data)).toEqual([{name: 'one'}, {name: 'two'}, {name: 'three'}]);
      done();
    });

  });

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
