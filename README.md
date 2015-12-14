# fbdb
[ ![Codeship Status for dannydavidson/fbdb](https://codeship.com/projects/50c99570-7eb5-0133-7a1a-5a4497a177a3/status?branch=master)](https://codeship.com/projects/120362) [![Coverage Status](https://coveralls.io/repos/dannydavidson/fbdb/badge.svg?branch=master&service=github)](https://coveralls.io/github/dannydavidson/fbdb?branch=master)

When writing a Firebase, you have a lot of options out of the gate.  The Firebase team maintains several binding libraries for the current crop of SPA frameworks, but most of them fit in at the view model level. For early prototypes this approach works well, but as your data model grows more complex you start to sorely miss the stateless simplicity of a well-defined REST API.

But you're writing a cutting-edge realtime app.  Your views don't simply request state, they subscribe to it.  How do you maintain not just the on/off state of data subscriptions with the server, but all the subscriptions to those data handles in your view/controller layers?  How do you test your API in isolation?

That's where `fbdb` can help.  It provides several base components that, when coupled together just right, allow you to write and test your Firebase much like a REST API.

## Database as Browserified Singleton

The Firebase team publishes their [isomorphic](http://isomorphic.net/) client library to [npm](https://www.npmjs.com/package/firebase). Paired with [browserify](http://browserify.org/) and `fbdb/Database`, we can generate a javascript bundle that encapsulates our entire service API.

To start we'll need an entry point.

```Javascript
// main.js

const memoize = require('lodash.memoize');
const Firebase = require('firebase');

const Database = require('fbdb/Database');
const Logger = require('fbdb/Logger');

const UsersRefs = require('UsersRefs');
const UsersService = require('UserService');

const TodosRefs = require('TodosRefs');
const TodosService = require('TodosService');

module.exports = memoize((firebaseUrl) => {

  let fb = new Firebase(firebaseUrl);

  let logger = new Logger();
  let db = new Database(fb, logger);

  db.add({
    users: new UsersService(db, new UsersRefs(fb), logger),
    todos: new TodosService(db, new TodosRefs(fb), logger)
  });

  return db;

});
```

We'll get into the details of each component further down, but after a quick browserify of our entry point:
```Shell
browserify -t [ babelify --presets [ es2015 ] ] -r ./main.js:db > ./dist/db.js
```
we have a portable bundle that we can easily drop into any javascript app to access our realtime database.
```Javascript
...
<script src="db.js"></script>
<script>
  var db = require('db')('example.firebaseio.com');

  // login with custom token (it's the only method that works both server and client side)
  db.login('{{CUSTOM_JWT}}').once('login', function () {

      // get user list handle
      var handle = db.users.getUsers();

      // subscribe to user list changes
      var cb = handle.on('change', function (list) {
        // mount some components/directives that
        // bind and render with each handle in list
        renderUserList(list);
      });

      ...

      // later when we unmount the subscribing list view
      handle.off('change', cb);

    });

</script>
```

### Database

The `Database` instance is the core singleton of `fbdb`.  It is the root of your service API, and maintains the session state on login/logout.  On startup, you should `add` any `Service` instances you need to implement your data model.

### Logger

One of the biggest challenges of a server-not-required application architecture is ensuring visibility into your running applications. Every component in `fbdb` expects to be initialized with a `Logger` instance.  You can extend the base `Logger`
to use the client-side logging mechanism of your choice. [Loggly](https://www.loggly.com/docs/javascript/), [Raven](https://docs.getsentry.com/hosted/clients/javascript/) and [Winston](https://github.com/winstonjs/winston) implementations are coming soon.

### Refs

In Firebase, every reference in your data tree is addressable. To help you to formalize and maintain your data structure, with `fbdb` you create a `Refs` subclass for each `Service` in your API. These co-exist alongside your [Bolt](https://www.firebase.com/docs/security/bolt/guide.html) security rules and should match the schema they define.

```Javascript
// UsersRefs.js

const usersPath = ['users'];

class UsersRefs extends Refs {

  // `get` returns a firebase child ref matching
  // the path segments passed as arguments

  getUsers() {
    return this.get(usersPath);
  }

  getUserWithId(id) {
    return this.get(usersPath.concat(id));
  }

}

// main.js

let fb = new Firebase('example.firebaseio.com');
let userRefs = new UsersRefs(fb);

```

### Service

Each service you define on your `fbdb` acts similarly to a single CRUD endpoint on a REST API. You can implement parameterized `create`, `update` and `remove` methods using Firebase methods directly, but your `read` methods should use the `register` and `get` methods if you want to enable live subscriptions.

`register` accepts a `Handle` subclass constructor and a `Refs` method as its only parameters. You should register your service handles at construction.

`get` accepts a `Handle` subclass constructor (that was previously registered) followed by any parameters the `Refs` method needs.

Internally, the `Service`'s `HandleManager` makes sure that there is only one handle per unique `get` request, caching each one that is created. When called again with the same parameters, it will return the cached handle.

`get` returns the new or cached handle, then on `process.nextTick` calls `handle.watch()` (described below). This gives the new caller time to bind to a handle's events before they are fired.

Each `Service` listens for the `Database` logout event, and when called calls `destroy` on each `Handle` in its cache.

```Javascript
// UsersService.js

class UsersService extends Service {

  constructor(db, refs, logger) {
    super(db, logger);
    this.refs = refs;
    this.register(UsersHandle, refs.getUsers);
    this.register(UserHandle, refs.getUserWithId);
  }

  createUser(data) {
    return new Promise((resolve, reject) => {
      this.refs.getUsers().push(data, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  getUsers() {
    return this.get(UsersHandle);
  }

  getUser(id) {
    return this.get(UserHandle, id);
  }

}

```

### Handle

The base handle implements a simple synchronous observer pattern. It mirrors Firebase's `on` behavior by returning the handler function passed, allowing you to use lambda callbacks in your client code without losing the reference.  `off` must be passed the event key and the registered callback function to successfully unbind each subscription.

Your application's `Handle` subclasses must extend `Handle` to take advantage of `Service`'s management functionality. `fbdb` includes a library of handles that implement common access patterns in Firebase. The list will continue to grow as `fbdb` matures.

#### handles/Entity

The `Entity` handle provides the interface for a single entity in your data model. It binds to the 'value' event of the passed in firebase reference, emitting a 'change' event.  It provides `set`, `setWithPriority`, `remove` and `update` methods for mutating the entity, wrapping the firebase callback flow with ES6 promises.

If you define a `validate` method in your subclass, it will be called before a write is attempted to Firebase. Return `undefined` on successful validation, some form of error object on failure.

```Javascript
// UserHandle.js

class UserHandle extends Entity {

  validate(oldData, newData) {
    if (newData.name.length < 2) {
      return [{message: 'Name must be greater than 2 characters'}];
    };
  }

}

// SomeComponent.js

let handle = db.users.getUser(db.uid);

handle.on('change', (data) => {
  render(data);
});

handle.update({name: 'D'})
  .catch((errs) => {
    renderErrors(errs);
  });

```

#### handles/List

The `List` handle provides the simplest form of list in Firebase. It subscribes to the `child_added`, `child_moved` and `child_removed` events of its firebase reference and emits 'change', 'added' and 'removed' events.

To implement, subclass `List` and override the `getEntity` method.  In `getEntity` you should delegate to a `Service` API method to return the correct `Entity` handle for each item in the list.  This ensures that for a service every handle is centrally managed in the `HandleManager`.

```Javascript
// UsersList.js

class UsersList extends List {

  getEntity(id) {
    return this.service.getUser(id);
  }

}

// SomeListComponent.js

let handle = db.users.getUsers();

let cb = handle.on('change', (list) => {
  renderList(list.map((item) => {
    console.log(item.id, item.handle);
    return item;
  }));
});

...

// later to unsubscribe
handle.off('change', cb);
```

#### handles/Connections

The `Connection` handle provides an easy wrapper around Firebase's presence capabilities.  It will `push` the current session's user agent string into Firebase and monitor the connected state, removing on `onDisconnect`.  It also subscribes to your connection list and emits a 'change' event any time it changes.  

## Contributing

`fbdb` is in its very early stages, but I'm going for 100% test coverage.  Please make sure your tests pass in node and phantom with `npm test` and confirm coverage with `npm run cover` before making a pull request.

## Roadmap

* Add `handles/IndexedList` and `handles/QueriedList`
* Add `loggers/LogglyLogger`, `loggers/RavenLogger` and `loggers/WinstonLogger`
* Add HTTP server for easily serving your `fbdb` API to http clients
* Add `fbdb/Task` and worker server utilizing [firebase-queue](https://github.com/firebase/firebase-queue)
