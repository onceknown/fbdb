'use strict';

const isEqual = require('lodash.isequal');
const IndexedList = require('./IndexedList');

class RenderedList extends IndexedList {

  buildList(newList, done) {
    let completed = 0;
    let newIndex = Object.keys(newList);

    if (!isEqual(this.index, newIndex)) {
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
              return index;
            }
          }
        },
        (err, committed, snapshot) => {
          if (!err && committed) {
            resolve(snapshot.val());
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
              return index;
            }
          }
        },
        (err, committed, snapshot) => {
          if (!err && committed) {
            resolve(snapshot.val());
          } else if (err) {
            reject(err);
          } else if (!committed) {
            reject({message: 'Move could not be committed'});
          }
        });
    });
  }
}

module.exports = RenderedList;
