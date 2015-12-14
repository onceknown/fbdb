'use strict';

const getEvents = function(event) {
  this._events = this._events || {};
  if (event in this._events === false) {
    event = this._events[event] = [];
    return event;
  }
  return this._events[event];
};

class Handle {

  constructor(fb, service, logger) {
    this.fb = fb;
    this.service = service;
    this.logger = logger;
  }

  watch() {
    console.warn('`watch` should be overwritten in subclass');
  }

  on(event, handler) {
    if (!event) {
      throw new Error('`on` requires an event key');
    }
    let events = getEvents.call(this, event);

    events.push(handler);
    return handler;
  }

  once(event, handler) {
    this.on(event, (payload) => {
      handler(payload);
      this.off(event, handler);
    });
  }

  off(event, handler) {
    let events = getEvents.call(this, event);

    events.splice(this._events[event].indexOf(handler), 1);
  }

  destroy() {
    for (var event in this._events) {
      if(this._events.hasOwnProperty(event)) {
        let handlers = this._events[event];

        for (let i = 0; i < handlers.length; i++) {
          this.off(event, handlers[i]);
        }
      }
    }
  }

  emit(event, data) {
    let events = getEvents.call(this, event);

    events.forEach((event) => {
      event(data);
    });
  }

  hasEventsFor() {
    let keys = Array.prototype.slice.call(arguments);

    for (let i = 0; i < keys.length; i++) {
      if (getEvents.call(this, keys[i]).length) {
        return true;
      }
    }
    return false;
  }

}

module.exports = Handle;
