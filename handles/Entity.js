'use strict';

const Handle = require('../Handle');

class Entity extends Handle {

  get id() {
    return this.fb.key();
  }

  emitChange() {
    if (this.data !== null) {
      this.emit('change', this.data);
    }
  }

  watch() {
    if (this.watcher) {
      return process.nextTick(() => {
        this.emitChange();
      });
    }
    this.watcher = this.fb.on('value',
      (snapshot) => {
        this.data = snapshot.val();
        this.emitChange(this);
      },
      (err) => {
        this.emit('disconnect', err);
      });
  }

  set(data, priority) {
    return new Promise((resolve, reject) => {
      let cb = (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      };
      let errors = this.validate(this.data, data);

      if (errors) {
        return reject(errors);
      }

      if (priority !== undefined) {
        return this.fb.set.call(null, data, priority, cb);
      }
      return this.fb.set.call(null, data, cb);
    });
  }

  update(data) {
    return new Promise((resolve, reject) => {
      let currentData = JSON.parse(JSON.stringify(this.data || {}));
      let newData = Object.assign(currentData, data);
      let errors = this.validate(this.data, newData);

      if (errors) {
        return reject(errors);
      }

      this.fb.update(data, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      this.fb.remove((err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  validate(oldData, newData) {
    console.warn('`validate` should be overwritten in subclass');
  }

  off() {
    super.off(...arguments);
    if (!this.hasEventsFor('change')) {
      this.fb.off('value', this.watcher);
      delete this.watcher;
      delete this.data;
      this.emit('unwatched');
    }
  }

}

module.exports = Entity;
