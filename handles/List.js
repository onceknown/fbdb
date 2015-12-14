'use strict';

const Handle = require('../Handle');

const addChild = function(prevKey, key, handle) {
  let prevIndex = this.ids.indexOf(prevKey);
  let insertionIndex = prevIndex + 1;

  this.ids.splice(insertionIndex, 0, key);
  this.handles.splice(insertionIndex, 0, handle);
};

const moveChild = function(key, prevKey) {
  let removed = removeChild.call(this, key);
  let prevIndex = this.ids.indexOf(prevKey);

  if (prevIndex !== -1) {
    let insertionIndex = prevIndex + 1;

    this.ids.splice(insertionIndex, 0, removed[0]);
    this.handles.splice(insertionIndex, 0, removed[1]);
  }
};

const removeChild = function(removedId) {
  let removedHandle;

  this.ids = this.ids.filter((id) => {
    return id !== removedId;
  });
  this.handles = this.handles.filter((handle, i) => {
    if (this.ids[i] === removedId) {
      removedHandle = handle;
      return false;
    }
    return true;
  });
  return [removedId, removedHandle];
};

class List extends Handle {

  get data() {
    let data = [];

    for (let i = 0; i < this.ids.length; i++) {
      data.push({id: this.ids[i], handle: this.handles[i]});
    }
    return data;
  }

  constructor() {
    super(...arguments);
    this.ids = [];
    this.handles = [];
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
      delete this.addedWatcher;
      delete this.removedWatcher;
      delete this.movedWatcher;
    }
  }

}
