/* global LogglyTracker */
'use strict';

class LogglyLogger {

  constructor(logglyKey, tags) {
    this.logger = new LogglyTracker();
    this.logger.push({logglyKey: logglyKey, tag: tags.join(',')});
  }

  push(data) {
    this.logger.push(data);
  }

  setSession(uid) {
    this.logger.setSession(uid);
  }

  clearSession() {
    delete this.logger.session_id;
    this.logger.setSession(null);
  }

}
