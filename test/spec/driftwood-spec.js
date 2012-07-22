describe("Driftwood", function() {
  var oldConsoleLogger  = console.log; //Currently overriding console.log to test, not sure of a cleaner way of handling this, pehraps create a virtual function driftwood would use.
  var lastConsoleMessage = "";
  var myLogger;
  var lastScriptTag = "";

  beforeEach(function() {
    myLogger = Driftwood.logger();
    lastConsoleMessage  = "";
    Driftwood.env("development"); //reset env before each test
    lastScriptTag = "";
    var oldConsoleLogger  = console.log;
    console.log = function(message) {
      lastConsoleMessage = message;
    }

  });
  afterEach(function() {
    console.log = oldConsoleLogger;    
  });

  it("should be able to log to console in development mode", function() {
    Driftwood.debug("test"); 
    expect(lastConsoleMessage.indexOf("test") == -1).toBeFalsy();
  });

  it("should be *not* be able to log to console in production mode", function() {
    Driftwood.env("PRODUCTION")
    Driftwood.debug("test"); 
    expect(lastConsoleMessage.indexOf("test")).toEqual(-1);
  });

  it("Instances of logger should work the same as the static logger", function(){
    myLogger.env("production"); //Only problem
    myLogger.debug("instance logger : Should not see this");
    expect(lastConsoleMessage.indexOf("instance")).toEqual(-1); //We should not find the string
    myLogger.error("instance logger : should see this 999");
    expect(lastConsoleMessage.indexOf("999") == -1).toBeFalsy(); //We should find the string
  });


  it("Setting log level should work", function(){
    myLogger.env("development"); 
    myLogger.logLevel("info"); //Should override
    myLogger.debug("instance logger : Should not see this");
    expect(lastConsoleMessage.indexOf("instance")).toEqual(-1); //We should not find the string
    myLogger.info("instance logger : should see this 1234");
    expect(lastConsoleMessage.indexOf("1234") == -1).toBeFalsy(); //We should find the string
    myLogger.error("instance logger : should see this 4567");
    expect(lastConsoleMessage.indexOf("4567") == -1).toBeFalsy(); //We should find the string
  });


  it("Sending exceptions should send request to server from exception", function(){
    myLogger._genScriptTag =  function(message) {  lastScriptTag = message }
    myLogger.env("production");
    try {
       throw new Error("funny error message");
    } catch(err) {
      myLogger.exception(err);
    }
    expect(lastScriptTag.indexOf("exceptions/notify") == -1).toBeFalsy(); //We should find the string
    expect(lastScriptTag.indexOf("funny") == -1).toBeFalsy(); //We should find the string
  });

  it("Sending exceptions should send request to server from string", function(){
    myLogger._genScriptTag =  function(message) {  lastScriptTag = message }
    myLogger.env("production");
    myLogger.exception("funny123");

    expect(lastScriptTag.indexOf("exceptions/notify") == -1).toBeFalsy(); //We should find the string
    expect(lastScriptTag.indexOf("funny123") == -1).toBeFalsy(); //We should find the string
  });

});