'use strict';

const expect = require('expect');
const Logger = require('../../loggers/ConsoleLogger');

describe('ConsoleLogger', () => {

  describe('push', () => {
    let logger = new Logger();
    let msg = {
      key: 'value'
    };

    expect.spyOn(console, 'log');
    logger.push(msg);
    expect(console.log.calls[0].arguments[0]).toBe('Unauthenticated - ' + JSON.stringify(msg));
    expect.restoreSpies();
  });

});
