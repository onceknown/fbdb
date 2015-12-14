'use strict';

const expect = require('expect');
const fbmocks = require('./fbmocks');
const Refs = require('../Refs');

describe('Refs', () => {

  describe('get', () => {
    let fb = fbmocks.fbMock(3);
    let refs = new Refs(fb);
    let child = refs.get('test', 'path', '1234');

    expect(fb.child).toHaveBeenCalledWith('test');
    expect(fb.child().child).toHaveBeenCalledWith('path');
    expect(fb.child().child().child).toHaveBeenCalledWith('1234');
  });

});
