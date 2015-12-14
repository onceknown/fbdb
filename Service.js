'use strict';

const HandleManager = require('./lib/HandleManager');

class Service {

  constructor(database, logger) {
    this.database = database;
    this.logger = logger;
    this.handles = new HandleManager(this, logger);

    database.on('logout', () => {
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
