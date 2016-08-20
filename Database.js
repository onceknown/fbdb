'use strict';

const Handle = require('./Handle');
const Service = require('./Service');

const addService = function(name, service) {
  Object.defineProperty(this, name, {
    value: service
  });
};

const setAuthFields = function(data) {
  this.uid = data.uid;
  this.auth = data.auth;
};

class Database extends Handle {

  get TIMESTAMP() {
    return this.firebase.database.ServerValue.TIMESTAMP;
  }

  get root() {
    return this.fb.ref('/');
  }

  constructor(firebase, logger) {
    super();
    this.firebase = firebase;
    this.fb = firebase.database();
    this.fbAuth = firebase.auth();
    this.logger = logger;

    this.fbAuth.onAuthStateChanged((data) => {
      if (data) {
        setAuthFields.call(this, data);
        this.logger.setSession(this.uid);
        this.emit('login', data);
      } else {
        delete this.uid;
        delete this.auth;
        this.logger.clearSession();
        this.emit('logout');
      }
    });
  }

  login(token) {
    this.fbAuth.signInWithCustomToken(token)
      .catch((err) => {
        if (err) {
          this.emit('login-error', err);
        }
      });
    return this;
  }

  logout() {
    this.fbAuth.signOut();
    return this;
  }

  add(name, service) {
    if (name !== null && typeof name === 'object') {
      for (let key in name) {
        if (name.hasOwnProperty(key)) {
          addService.call(this, key, name[key]);
        }
      }
    } else if (typeof name === 'string' && service instanceof Service) {
      addService.call(this, name, service);
    } else {
      console.warn('`Database.add` was called incorrectly, service was not added.');
    }
  }

}

module.exports = Database;
