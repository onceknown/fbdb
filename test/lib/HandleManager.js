'use strict';

const expect = require('expect');
const fbmocks = require('../fbmocks');

const Handle = require('../../Handle');
const HandleManager = require('../../lib/HandleManager');

describe('HandleManager', () => {

  describe('register', () => {

    it('throws if Constructor does not extend Handle', () => {
      class Tester {}
      let manager = new HandleManager();

      expect(() => { manager.register(Tester, () => {}); }).toThrow();
    });

    it('throws if nsResolver is not a function', () => {
      class Tester extends Handle {}
      let manager = new HandleManager();

      expect(() => { manager.register(Tester, undefined); }).toThrow();
    });

  });

  describe('get', () => {

    it('returns correctly constructed handle', () => {
      let manager = new HandleManager();
      let fb = fbmocks.fbMock();
      let resolver = expect.createSpy().andReturn(fb);

      manager.register(Handle, resolver);

      let handle = manager.get(Handle, '1', '2');

      expect(resolver).toHaveBeenCalledWith('1', '2');
      expect(handle.fb).toBe(fb);
    });

    it('returns cached handle after first call', () => {
      let manager = new HandleManager();
      let fb = fbmocks.fbMock();
      let resolver = expect.createSpy().andReturn(fb);

      manager.register(Handle, resolver);

      let handle = manager.get(Handle, '1', '2');
      let handle2 = manager.get(Handle, '1', '2');

      expect(handle).toBe(handle2);
    });

    it('throws if Constructor hasn\'t been registered', () => {
      let manager = new HandleManager();

      expect(() => { manager.get(Handle); }).toThrow();
    });

  });

  describe('off', () => {

    it('calls `destroy` on all handles', () => {
      let manager = new HandleManager();
      let fb = fbmocks.fbMock();
      let resolver = expect.createSpy().andReturn(fb);

      class HandleSubclass extends Handle {}

      manager.register(HandleSubclass, resolver);
      manager.register(Handle, resolver);

      let handle1 = manager.get(Handle, '1', '2');
      let handle2 = manager.get(HandleSubclass, '1', '2');

      expect.spyOn(handle1, 'destroy');
      expect.spyOn(handle2, 'destroy');

      manager.off();

      expect(handle1.destroy.calls.length).toBe(1);
      expect(handle2.destroy.calls.length).toBe(1);

    });

  });

});
