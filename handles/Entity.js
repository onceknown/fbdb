'use strict';

const Handle = require('../Handle');

const emitChange = function() {
  if (this.data !== null) {
    this.emit('change', this.data);
  }
};

class Entity extends Handle {

  watch() {
    if (this.watcher) {
      return process.nextTick(() => {
        emitChange.call(this);
      });
    }
    this.watcher = this.fb.on('value',
      (snapshot) => {
        this.data = snapshot.val();
        emitChange.call(this);
      },
      (err) => {
        this.emit('disconnect', err);
      });
  }

  set(data) {
    return new Promise((resolve, reject) => {
      let errors = this.validate(this.data, data);

      if (errors) {
        return reject(errors);
      }

      this.fb.set(data, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  setWithPriority(data, priority) {
    return new Promise((resolve, reject) => {
      let errors = this.validate(this.data, data);

      if (errors) {
        return reject(errors);
      }

      this.fb.set(data, priority, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  update(data) {
    return new Promise((resolve, reject) => {
      let newData = Object.assign(JSON.parse(JSON.stringify(this.data)), data);
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
    }
  }

}

module.exports = Entity;
