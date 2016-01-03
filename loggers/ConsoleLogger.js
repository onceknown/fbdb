'use strict';

class Logger {

  constructor() {
    this.clearSession();
  }

  push(data) {
    console.log(this.sessionId + ' - ' + JSON.stringify(data));
  }

  setSession(uid) {
    this.sessionId = uid;
  }

  clearSession() {
    this.sessionId = 'Unauthenticated';
  }

}

module.exports = Logger;
