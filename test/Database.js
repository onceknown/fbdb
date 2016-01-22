'use strict';

const expect = require('expect');
const fbmocks = require('./fbmocks');
const Database = require('../Database');
const Service = require('../Service');
const Refs = require('../Refs');

describe('Database', () => {

  it('sets `uid` and `auth` properties if firebase already authed at initialization', () => {
    let db = new Database(fbmocks.authMock({
      uid: '1234',
      auth: {
        key: 'value'
      }
    }));

    expect(db.uid).toBe('1234');
    expect(db.auth.key).toBe('value');
  });

  it('registers handler for firebase auth changes', () => {
    let fb = fbmocks.authMock(null);
    let db = new Database(fb);

    expect(typeof fb.onAuth.calls[0].arguments[0]).toBe('function');
  });

  it('emits "login" event and sets uid and auth properties on successful login', () => {
    let fb = fbmocks.authMock(null);
    let logger = {setSession: expect.createSpy(), clearSession: expect.createSpy()};
    let db = new Database(fb, logger);
    let onLogin = expect.createSpy();
    let data = {
      uid: '1234',
      auth: {
        key: 'value'
      }
    };

    db.once('login', onLogin);
    fb.callAuthCallback(data);

    expect(onLogin.calls[0].arguments[0]).toBe(data);
    expect(onLogin.calls.length).toBe(1);
    expect(db.uid).toBe('1234');
    expect(db.auth.key).toBe('value');
    expect(logger.setSession).toHaveBeenCalledWith('1234');

  });

  it('emits "logout" event and unsets uid and auth properties on successful logout', () => {
    let fb = fbmocks.authMock(null);
    let logger = {setSession: expect.createSpy(), clearSession: expect.createSpy()};
    let db = new Database(fb, logger);
    let data = {
      uid: '1234',
      auth: {
        key: 'value'
      }
    };

    db.once('login', () => {
      db.once('logout', () => {
        expect(db.uid).toBe(undefined);
        expect(db.auth).toBe(undefined);
        expect(logger.clearSession).toHaveBeenCalled();
      });
      expect(db.uid).toBe('1234');
      expect(db.auth.key).toBe('value');
      expect(logger.setSession).toHaveBeenCalledWith('1234');
      fb.callAuthCallback(null);
    });
    fb.callAuthCallback(data);
  });

  describe('login', () => {

    it('calls `fb.authWithCustomToken` with token and callback', () => {
      let fb = fbmocks.authMock(null);
      let db = new Database(fb);

      db.login('1234', () => {});

      let args = fb.authWithCustomToken.calls[0].arguments;

      expect(args[0]).toBe('1234');
      expect(typeof args[1]).toBe('function');
    });

    it('emits "login-error" if login fails', () => {
      let fb = fbmocks.authMock(null);
      let db = new Database(fb);
      let onLogin = expect.createSpy();
      let error = {message: 'error'};

      db.once('login-error', onLogin);
      db.login('1234');

      fb.callAuthWithCustomTokenCallback(error);

      expect(onLogin.calls[0].arguments[0]).toBe(error);
    });
  });

  describe('logout', () => {

    it('calls `fb.unauth`', () => {
      let fb = fbmocks.authMock(null);
      let db = new Database(fb);

      db.logout();
      expect(fb.unauth.calls.length).toBe(1);
    });

  });

  describe('add', () => {
    it('adds service property when called with name and service params', () => {
      let db = new Database(fbmocks.authMock(null));

      class ServiceSubclass extends Service {}
      let service = new ServiceSubclass(db, new Refs());

      db.add('service', service);

      expect(db.service).toBe(service);
    });
    it('adds service properties when called with object param', () => {
      let db = new Database(fbmocks.authMock(null));

      class Users extends Service {}
      class Accounts extends Service {}

      let users = new Users(db, new Refs());
      let accounts = new Accounts(db, new Refs());

      db.add({
        users: users,
        accounts: accounts
      });

      expect(db.users).toBe(users);
      expect(db.accounts).toBe(accounts);
    });

    it('warns if called incorrectly', () => {
      let db = new Database(fbmocks.authMock(null));

      expect.spyOn(console, 'warn');
      db.add();
      db.add('value');
      expect(console.warn.calls.length).toBe(2);
      expect.restoreSpies();
    });
  });

  describe('TIMESTAMP', () => {

    it('delegates to firebase ServerValue', () => {
      let mock = fbmocks.authMock(null);
      let db = new Database(mock);

      expect(db.TIMESTAMP).toBe(mock.constructor.ServerValue.TIMESTAMP);
    });

  });
});
