'use strict';

const expect = require('expect');
const Handle = require('../Handle');

describe('Handle', () => {

  describe('on', () => {

    it('registers event handler and returns reference', () => {
      let payload = 'data';
      let handle = new Handle();
      let handler = function(val) {
        expect(val).toEqual(payload);
      };
      let returnedHandle = handle.on('change', handler);

      expect(returnedHandle).toBe(handler);
      handle.emit('change', payload);
    });

    it('throws if event key not passed', () => {
      let handle = new Handle();

      expect(() => { handle.on(); }).toThrow();
    });

  });

  describe('once', () => {

    it('removes handler after first call', () => {
      let payload = 'data';
      let handle = new Handle();
      let handler = expect.createSpy();

      handle.once('change', handler);

      handle.emit('change', 'data');
      handle.emit('change', 'data');

      expect(handler.calls.length).toBe(1);
      expect(handler).toHaveBeenCalledWith('data');
    });

  });


  describe('off', () => {

    it('removes event handler', () => {
      let handle = new Handle();
      let spy = expect.createSpy();

      handle.on('change', spy);
      handle.off('change', spy);
      handle.emit('change');

      expect(spy.calls.length).toBe(0);
    });

  });

  describe('emit', () => {

    it('calls handlers with payload', () => {
      let handle = new Handle();
      let spy = expect.createSpy();

      handle.on('change', spy);
      handle.emit('change', 'data');

      expect(spy.calls.length).toBe(1);
      expect(spy).toHaveBeenCalledWith('data');
    });

  });

  describe('destroy', () => {

    it('calls off for every event and handler', () => {
      let handle = new Handle();
      let handler1 = () => {};
      let handler2 = () => {};
      let handler3 = () => {};

      expect.spyOn(handle, 'off');

      handle.on('event1', handler1);
      handle.on('event1', handler2);
      handle.on('event2', handler3);

      handle.destroy();

      expect(handle.off.calls[0].arguments[0]).toBe('event1');
      expect(handle.off.calls[0].arguments[1]).toBe(handler1);
      expect(handle.off.calls[1].arguments[0]).toBe('event1');
      expect(handle.off.calls[1].arguments[1]).toBe(handler2);
      expect(handle.off.calls[2].arguments[0]).toBe('event2');
      expect(handle.off.calls[2].arguments[1]).toBe(handler3);
    });

  });

  describe('hasEventsFor', () => {

    it('returns correct status of event handlers', () => {
      let handle = new Handle();

      handle.on('event1', () => {});
      handle.on('event2', () => {});

      expect(handle.hasEventsFor('event1')).toBe(true);
      expect(handle.hasEventsFor('event1', 'event2')).toBe(true);
      expect(handle.hasEventsFor('event3')).toBe(false);
    });

  });

});
