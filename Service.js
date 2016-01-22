'use strict';

const HandleManager = require('./lib/HandleManager');

class Service {

  get TIMESTAMP() {
    return this.db.TIMESTAMP;
  }

  constructor(db, logger) {
    this.db = db;
    this.logger = logger;
    this.handles = new HandleManager(this, logger);

    db.on('logout', () => {
      this.off();
    });
  }

  get() {
    let handle = this.handles.get(...arguments);

    process.nextTick(() => {
      handle.watch();
    });
    return handle;
  }

  register() {
    this.handles.register(...arguments);
  }

  off() {
    this.handles.off();
  }

}

module.exports = Service;
