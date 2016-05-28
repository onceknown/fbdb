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
      let list = snapshot.val;

      if (list) {
        this.buildList(list, () => {
          this.emit('change', this.data);
        });
      } else {
        this.emit('change', this.data);
      }
    });
  }

  moveBefore(movedId, referenceId) {
    return new Promise((resolve, reject) => {
      this.fb.transaction(
        (index) => {
          let insertionIndex;
          let movedIndex = index.indexOf(movedId);

          if (movedIndex !== -1) {
            index.splice(movedIndex, 1);
            insertionIndex = index.indexOf(referenceId);

            if (insertionIndex !== -1) {
              index.splice(insertionIndex, 0, movedId);
            }
          }

          return index;
        },
        (err, committed, snapshot) => {
          if (!err && committed) {
            resolve(snapshot.val);
          } else if (err) {
            reject(err);
          } else if (!committed) {
            reject({message: 'Move could not be committed'});
          }
        });
    });
  }

  moveAfter(movedId, referenceId) {
    return new Promise((resolve, reject) => {
      this.fb.transaction(
        (index) => {
          let insertionIndex;
          let movedIndex = index.indexOf(movedId);

          if (movedIndex !== -1) {
            index.splice(movedIndex, 1);
            insertionIndex = index.indexOf(referenceId);

            if (insertionIndex !== -1) {
              index.splice(insertionIndex + 1, 0, movedId);
            }
          }

          return index;
        },
        (err, committed, snapshot) => {
          if (!err && committed) {
            resolve(snapshot.val);
          } else if (err) {
            reject(err);
          } else if (!committed) {
            reject({message: 'Move could not be committed'});
          }
        });
    });
  }

  buildList(newIndex, done) {
    let completed = 0;

    this.index = newIndex;
    this.handles = {};

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
