'use strict';

const EventEmitter = require('events');

const _ = require('lodash');
const expect = require('expect');

const MAX_CHILD_STUBS = 2;

module.exports.fbMock = function(numChildren) {
  numChildren = numChildren || MAX_CHILD_STUBS;
  let numChildrenStubbed = 0;
  let FirebaseMock = function() {
    this.on = expect.createSpy().andReturn(function() {});
    this.once = expect.createSpy();
    this.off = expect.createSpy();
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

module.exports.snapshotMock = function(data) {
  return {
    val: function() {
      return data;
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
    }
  };

  expect.spyOn(mock, 'authWithCustomToken').andCallThrough();
  expect.spyOn(mock, 'onAuth').andCallThrough();

  return mock;
};
