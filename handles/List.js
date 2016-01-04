'use strict';

const Handle = require('../Handle');

const addChild = function(prevKey, key, handle) {
  let prevIndex = prevKey === null ? -1 : this.ids.indexOf(prevKey);
  let insertionIndex = prevIndex + 1;

  this.ids.splice(insertionIndex, 0, key);
  this.handles[key] = handle;
};

const moveChild = function(key, prevKey) {
  removeChild.call(this, key, true);
  let prevIndex = prevKey === null ? -1 : this.ids.indexOf(prevKey);
  let insertionIndex = prevIndex + 1;

  this.ids.splice(insertionIndex, 0, key);
};

const removeChild = function(removedId, keepHandle) {
  let removedHandle;

  this.ids = this.ids.filter((id) => {
    return id !== removedId;
  });

  if (!keepHandle) {
    delete this.handles[removedId];
  }
};

class List extends Handle {

  get data() {
    let data = [];

    for (let i = 0; i < this.ids.length; i++) {
      data.push(this.handles[this.ids[i]]);
    }
    return data;
  }

  constructor() {
    super(...arguments);
    this.ids = [];
    this.handles = {};
  }

  watch() {
    if (this.addedWatcher) {
      return process.nextTick(() => {
        this.emit('change', this.data);
      });
    }

    this.addedWatcher = this.fb.on('child_added', (snapshot, prevKey) => {
      let key = snapshot.key();
      let handle = this.getEntity(key);
      let added = addChild.call(this, prevKey, key, handle);

      this.emit('added', added);
      this.emit('change', this.data);
    });

    this.removedWatcher = this.fb.on('child_removed', (snapshot) => {
      let key = snapshot.key();

      removeChild.call(this, key);
      this.emit('removed', key);
      this.emit('change', this.data);
    });

    this.movedWatcher = this.fb.on('child_moved', (snapshot, prevKey) => {
      let key = snapshot.key();

      moveChild.call(this, key, prevKey);
      this.emit('change', this.data);
    });

  }

  getEntity(id) {
    console.warn('`getEntity` should be defined in your subclass');
  }

  off() {
    super.off(...arguments);
    if (!this.hasEventsFor('change', 'added', 'removed')) {
      this.fb.off('child_added', this.addedWatcher);
      this.fb.off('child_removed', this.removedWatcher);
      this.fb.off('child_moved', this.movedWatcher);
      this.ids = [];
      this.handles = {};
      delete this.addedWatcher;
      delete this.removedWatcher;
      delete this.movedWatcher;
      this.emit('unwatched');
    }
  }

}

module.exports = List;
