'use strict';

class Logger {

  push(data) {
    console.log(JSON.stringify(data));
  }

}

module.exports = Logger;
