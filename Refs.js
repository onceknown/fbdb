'use strict';

const getChildRef = function(parent, child) {
  return parent.child(child);
};

class Refs {

  constructor(rootRef) {
    this.rootRef = rootRef;
  }

  get() {
    let path = Array.prototype.slice.call(arguments);

    return path.reduce(getChildRef, this.rootRef);
  }

}

module.exports = Refs;
