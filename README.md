driftwood.js
============

Driftwood a dirt simple logging framework for javascript


### Goals ###

*  Logging should be simple, this isn't java we don't need abstract interfaces
   just a few simple options.
*  4 Log levels, thats it. (`debug`, `info`, `error`, and `exception`)
*  Allow exceptions or logs to be sent to a backend server. If an error falls
   in the forest and no one hears it did it really happen?

### Install ###

We're registered on bower:

`bower install --save driftwood.js`

Or, if bower ain't your thing, simply include `driftwood.js` or
`driftwood.min.js` in your project.

### Getting Started ###

Getting started with driftwood is dead simple. You don't have to created an
instance, you can just use the static logger methods:

```js
Driftwood.info("my info message");
Driftwood.debug("my debug message");
Driftwood.error("my error message");
```

In addition to the above 3 methods, we also have a 4th *special* method,
`exception`. This method logs to your backend if configured.

```js
Driftwood.exception("an exceptional message");
```

To configure your backend url. **Note** -- this is cross origin safe since we
use `GET` requests.

```
Driftwood.setServerPath("/errors/test?payload=")
```

Driftwood's default environment is 'development'. Environments control which
messages are actually displayed in the console.

With the 'development' environment, we show all log messages in the console.
The alternate is 'production'; and it will only display errors on the console.
You can change the environment with the `env` method.

```js
Driftwood.env("production");
```

If having a single static logger doesn't work for you, you can also create
multiple logger instances:

```js
var my_logger = new Driftwood.logger();
my_logger.env("production");
my_logger.debug("instance logger : Should not see this");
my_logger.error("instance logger : should see this");
```

In addition to setting the environment, you can also manually change the
current log level:

```js
my_logger.logLevel("INFO")
Driftwood.logLevel("ERROR")
```

By default any uncaught exceptions in your application's window will goto Driftwood, to manually send one

```js
Driftwood.exception("Message here")
Driftwood.exception(exception_obj)
```


To check out a nicely formatted help page of the source code

[Commented source code](http://mattkanwisher.github.io/driftwood.js/)

To contribute to this project please fork, and add tests to whatever you change so its easier to maintain. See the test folder for jasmine tests and open specrunner.html.
