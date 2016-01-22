'use strict';

const expect = require('expect');
const fbmocks = require('./fbmocks');
const Service = require('../Service');
const Entity = require('../handles/Entity');

describe('Service', () => {

  let db = {on: expect.createSpy(), TIMESTAMP: 1};

  it('registers for database logout on construction', () => {
    let service = new Service(db);

    expect(db.on.calls.length).toBe(1);
    expect(db.on.calls[0].arguments[0]).toBe('logout');
  });

  it('turns `off` on database logout event', () => {
    let db = fbmocks.fbEventsMock();
    let service = new Service(db);

    expect.spyOn(service, 'off');
    db.emit('logout');
    expect(service.off.call.length).toBe(1);
  });

  describe('get', () => {

    it('returns a registered handle and tells it to `watch` on the next tick', (done) => {
      let handle;
      let service = new Service(db);
      let refSpy = expect.createSpy();

      service.register(Entity, refSpy);

      handle = service.get(Entity, '1', '2');

      expect(handle instanceof Entity).toBe(true);
      expect(refSpy.calls[0].arguments).toEqual(['1', '2']);

      expect.spyOn(handle, 'watch');
      setTimeout(() => {
        try {
          expect(handle.watch.calls.length).toBe(1);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('register', () => {

    it('delegates to `HandleManager.register`', () => {
      let service = new Service(db);
      let refResolver = () => {};

      expect.spyOn(service.handles, 'register');
      service.register(Entity, refResolver);
      expect(service.handles.register).toHaveBeenCalledWith(Entity, refResolver);
    });

  });

  describe('off', () => {

    it('delegates to `HandleManager.off`', () => {
      let service = new Service(db);
      let refResolver = () => {};

      expect.spyOn(service.handles, 'off');
      service.off();
      expect(service.handles.off.calls.length).toBe(1);
    });

  });

  describe('TIMESTAMP', () => {

    it('delegates to db.TIMESTAMP', () => {
      let service = new Service(db);
      let stamp = service.TIMESTAMP;

      expect(stamp).toBe(db.TIMESTAMP);

    });

  });

});
