'use strict';

const expect = require('expect');
const fbmocks = require('../fbmocks');

const List = require('../../handles/List');
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

describe('handles/List', () => {

  it('inserts handle on "child_added" at correct index', () => {
    let mock = fbmocks.fbMock();
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
      },
      '4': {
        name: 'four'
      },
      '5': {
        name: 'five'
      }
    };
    let handles = {};

    handle.getEntity = getEntity(listItems, handles);
    handle.watch();

    mock.callEvent('on', 'child_added', fbmocks.snapshotMock({}, '1'), null);
    mock.callEvent('on', 'child_added', fbmocks.snapshotMock({}, '2'), '1');
    mock.callEvent('on', 'child_added', fbmocks.snapshotMock({}, '3'), '2');

    mock.callEvent('on', 'child_added', fbmocks.snapshotMock({}, '4'), '1');

    expect(handle.data).toEqual([handles['1'], handles['4'], handles['2'], handles['3']]);

    mock.callEvent('on', 'child_added', fbmocks.snapshotMock({}, '5'), null);

    expect(handle.data).toEqual([handles['5'], handles['1'], handles['4'], handles['2'], handles['3']]);
  });

  it('removes handle on "child_removed"', () => {
    let mock = fbmocks.fbMock();
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

    mock.callEvent('on', 'child_added', fbmocks.snapshotMock({}, '1'), null);
    mock.callEvent('on', 'child_added', fbmocks.snapshotMock({}, '2'), '1');
    mock.callEvent('on', 'child_added', fbmocks.snapshotMock({}, '3'), '2');

    mock.callEvent('on', 'child_removed', fbmocks.snapshotMock({}, '2'));

    expect(handle.data).toEqual([handles['1'], handles['3']]);
  });

  it('moves handle on "child_moved"', () => {
    let mock = fbmocks.fbMock();
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

    mock.callEvent('on', 'child_added', fbmocks.snapshotMock({}, '1'), null);
    mock.callEvent('on', 'child_added', fbmocks.snapshotMock({}, '2'), '1');
    mock.callEvent('on', 'child_added', fbmocks.snapshotMock({}, '3'), '2');

    mock.callEvent('on', 'child_moved', fbmocks.snapshotMock({}, '2'), null);

    expect(handle.data).toEqual([handles['2'], handles['1'], handles['3']]);
  });

  describe('watch', () => {

    it('subscribes to "child_added", "child_removed" and "child_moved" events on fb reference', () => {
      let mock = fbmocks.fbMock();
      let handle = new List(mock);

      handle.watch();
      expect(mock.on.calls[0].arguments[0]).toBe('child_added');
      expect(mock.on.calls[1].arguments[0]).toBe('child_removed');
      expect(mock.on.calls[2].arguments[0]).toBe('child_moved');
    });

    it('does not create new firebase subscription when handle is already watching', () => {
      let mock = fbmocks.fbMock();
      let handle = new List(mock);

      handle.watch();
      handle.watch();
      expect(mock.on.calls.length).toBe(3);
    });

  });

});
