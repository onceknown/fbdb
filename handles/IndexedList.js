'use strict';

const Handle = require('../Handle');

class IndexedList extends Handle {

  get data() {
    let data = [];

    for (let i = 0; i < this.index.length; i++) {
      data.push(this.handles[this.index[i]]);
    }
    return data;
  }

  constructor() {
    super(...arguments);
    this.index = [];
    this.handles = {};
  }

  watch() {
    if (this.indexWatcher) {
      return process.nextTick(() => {
        this.emit('change', this.data);
      });
    }

    this.indexWatcher = this.fb.on('value', (snapshot) => {
      this.buildList(snapshot.val(), () => {
        this.emit('change', this.data);
      });
    });

  }

  buildList(newIndex, done) {
    let completed = 0;

    this.index = newIndex;
    this.index.forEach((id) => {
      let handle = this.handles[id] = this.getEntity(id);

      handle.once('change', () => {
        if(++completed === newIndex.length) {
          done();
        }
      });
    });
  }

  getEntity(id) {
    console.warn('`getEntity` should be defined in your subclass');
  }

  off() {
    super.off(...arguments);
    if (!this.hasEventsFor('change')) {
      this.fb.off('value', this.indexWatcher);
      this.index = [];
      this.handles = {};
      delete this.indexWatcher;
      this.emit('unwatched');
    }
  }

}

module.exports = IndexedList;
