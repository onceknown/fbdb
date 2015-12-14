'use strict';

const getChildRef = function(parent, child) {
  return parent.child(child);
};

class Refs {

  constructor(fb) {
    this.fb = fb;
  }

  get() {
    let path = Array.prototype.slice.call(arguments);

    return path.reduce(getChildRef, this.fb);
  }

}

module.exports = Refs;
