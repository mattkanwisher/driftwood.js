driftwood.js
============

Driftwood a dirt simple logging framework for javascript


The following goals of driftwood :

* Logging should be simple, this isn't java we don't need abstract interfaces just a few simple options.
* 4 Log levels thats it.
* Allow exceptions or logs to be sent to a backend server. If an error falls in the forrest and no one hears it did it really happen?


We have a static logger called Drifwood, feel free to call the usual methods on it, debug, info, error.
```
Driftwood.debug("test"); 
```

We have one special one, this one will send it to your back end
```
Driftwood.exception("message")
```

We have two default environment, development and production. Production only shows errors on the console. Development shows all errors.
```
Driftwood.env("development"); //Debug and everything
```

If you need multiple instances of loggers just make a new one.
```
var my_logger = new Driftwood.logger();
my_logger.env("production");
my_logger.debug("instance logger : Should not see this");
my_logger.error("instance logger : should see this");
```
To configure log levels
```
my_logger.log_level("INFO")
Driftwood.log_level("ERROR")
```

By default any uncaught exceptions in your app win goto Driftwood, to manually send one
```
Driftwood.exception("Message here")
Driftwood.exception(exception_obj)
```

To configure your backend url. *note this is cross origin safe since we use gets
```
Driftwood.url("/errors/test?")
```

Also if you don't have a backend you can use it with your [Errplane account](http://errplane.com)
```
Driftwood.url("https://api.errplane.com/v1/jserrors/test?apikey=<write_only_api_key>&=")
```

To check out a nicely formatted help page of the source code

[Commented source code](http://errplane.github.com/driftwood.js/)

To contribute to this project please fork, and add tests to whatever you change so its easier to maintain. See the test folder for jasmine tests and open specrunner.html.