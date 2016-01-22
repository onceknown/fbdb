'use strict';

const EventEmitter = require('events');

const _ = require('lodash');
const expect = require('expect');

const MAX_CHILD_STUBS = 2;

module.exports.fbMock = function(numChildren) {
  numChildren = numChildren || MAX_CHILD_STUBS;
  let numChildrenStubbed = 0;
  let FirebaseMock = function() {
    this.callbacks = {};

    this.key = expect.createSpy();

    this.on = (event, cb) => {
      this.callbacks.on = this.callbacks.on || {};
      this.callbacks.on[event] = cb;
      return cb;
    };

    this.once = (event, cb) => {
      this.callbacks.once = this.callbacks.once || {};
      this.callbacks.once[event] = cb;
    };

    this.off = (event, cb) => {
      this.callbacks.off = this.callbacks.off || {};
      this.callbacks.off[event] = cb;
    };

    this.set = (value, priority, cb) => {
      if (typeof priority === 'function') {
        this.callbacks.set = priority;
      } else {
        this.callbacks.set = cb;
      }
    };

    this.update = (value, cb) => {
      this.callbacks.update = cb;
    };

    this.remove = (cb) => {
      this.callbacks.remove = cb;
    };

    this.callCallback = (method, value) => {
      this.callbacks[method](value);
    };

    this.callEvent = function(method, evt) {
      this.callbacks[method][evt](...Array.prototype.slice.call(arguments, 2));
    }.bind(this);

    expect.spyOn(this, 'on').andCallThrough();
    expect.spyOn(this, 'once').andCallThrough();
    expect.spyOn(this, 'off').andCallThrough();
    expect.spyOn(this, 'set').andCallThrough();
    expect.spyOn(this, 'update').andCallThrough();
    expect.spyOn(this, 'remove').andCallThrough();

    if (numChildrenStubbed < numChildren) {
      numChildrenStubbed++;
      this.child = expect.createSpy().andReturn(new FirebaseMock());
    }
  };

  return new FirebaseMock();
};

module.exports.fbEventsMock = function() {
  class Mock extends EventEmitter {}
  return new Mock();
};

module.exports.valueMock = function() {
  let mock = {
    on: function(key, handler, canceler) {
      this.handler = handler;
      this.canceler = canceler;
    },
    once: function(key, handler, canceler) {
      this.handler = handler;
      this.canceler = canceler;
    },
    callHandler: function(snapshot) {
      this.handler(snapshot);
    },
    callCanceler: function(err) {
      this.canceler(err);
    }
  };

  expect.spyOn(mock, 'on').andCallThrough();
  expect.spyOn(mock, 'once').andCallThrough();

  return mock;
};

module.exports.snapshotMock = function(data, key) {
  return {
    val: function() {
      return data;
    },
    key: function() {
      return key;
    }
  };
};

module.exports.authMock = function(getAuthValue) {
  let mock = {
    getAuth: expect.createSpy().andReturn(getAuthValue),
    unauth: expect.createSpy(),
    onAuth: function(callback) {
      this.onAuthCallback = callback;
    },
    authWithCustomToken: function(token, callback) {
      this.authWithCustomTokenCallback = callback;
    },
    callAuthCallback: function(data) {
      this.onAuthCallback(data);
    },
    callAuthWithCustomTokenCallback: function(err, data) {
      this.authWithCustomTokenCallback(err, data);
    },
    constructor: {
      ServerValue: {
        TIMESTAMP: 1
      }
    }
  };

  expect.spyOn(mock, 'authWithCustomToken').andCallThrough();
  expect.spyOn(mock, 'onAuth').andCallThrough();

  return mock;
};
