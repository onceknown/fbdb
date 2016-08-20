'use strict';


class Connections {

  get agent() {
    return navigator ? navigator.userAgent : 'UNKNOWN';
  }

  watch() {
    if (this.connectionWatcher) {
      process.nextTick(() => {
        this.emit('change', this.data);
      });
    } else {
      this.infoFb = this.fb('/.info/connected');
      this.connectionWatcher = this.infoFb.on('value',
        (snapshot) => {
          if (snapshot.val()) {
            return this.connect();
          }
          return this.disconnect();
        },
        (err) => {
          if (err) {
            this.emit('error', err);
            this.disconnect();
          }
        });
    }
  }

  off() {
    super.off(...arguments);
    this.disconnect();
  }

  connect() {
    if (!this.connectionRef) {
      this.connectionRef = this.fb.push(this.agent, (err) => {
        this.emit('error', err);
      });

      this.connectionRef.onDisconnect().remove();

      this.listWatcher = this.fb.on('value',
        (snapshot) => {
          this.data = snapshot.val();
          this.emit('change', this.data);
        },
        (err) => {
          err && this.emit('error', err);
        });
    }
  }

  disconnect() {
    this.connectionRef.remove((err) => {
      err && this.emit('error', err);
    });
    this.fb.off('value', this.listWatcher);
    this.infoFb.off('value', this.connectionWatcher);
    delete this.listWatcher;
    delete this.connectionWatcher;
    delete this.connectionRef;
    delete this.data;
  }

}

module.exports = Connections;
