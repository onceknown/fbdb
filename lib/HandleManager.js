'use strict';

const Handle = require('../Handle');

class HandleManager {

  constructor(service, logger) {
    this.service = service;
    this.logger = logger;
    this.handles = {};
    this.refResolvers = {};
  }

  register(Constructor, refResolver) {
    if (!(Constructor === Handle || Constructor.prototype instanceof Handle)) {
      throw new Error('Constructor must be a Handle constructor');
    }
    if (typeof refResolver !== 'function') {
      throw new Error('refResolver must be a function');
    }
    this.handles[Constructor] = {};
    this.refResolvers[Constructor] = refResolver;
  }

  get(Constructor) {
    if (!this.handles[Constructor]) {
      throw new Error('You must `register` a Handle constructor before you can `get`');
    }

    let args = Array.prototype.slice.call(arguments, 1);
    let key = args.join('|');
    let handle = this.handles[Constructor][key];

    if (handle) {
      return handle;
    }

    let refResolver = this.refResolvers[Constructor];
    let newHandle = this.handles[Constructor][key] = new Constructor(refResolver(...args), this.service, this.logger);

    return newHandle;
  }

  off() {
    for (let handles in this.handles) {
      if (this.handles.hasOwnProperty(handles)) {
        for (let handle in this.handles[handles]) {
          if (this.handles[handles].hasOwnProperty(handle)) {
            this.handles[handles][handle].destroy();
            delete this.handles[handles][handle];
          }
        }
      }
    }
  }

}

module.exports = HandleManager;
