'use strict';

const Entity = require('./Entity');

class LazyEntity extends Entity {

  emitChange() {
    this.emit('change', this.data);
  }

}

module.exports = LazyEntity;
