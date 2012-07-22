describe("Driftwood", function() {
  var old_console_logger  = console.log; //Currently overriding console.log to test, not sure of a cleaner way of handling this, pehraps create a virtual function driftwood would use.
  console.log = function(message) {
    last_console_message = message;
  }
  var last_console_message = "";
  var my_logger;

  beforeEach(function() {
    my_logger = Driftwood.logger();
    last_console_message  = "";
    Driftwood.env("development"); //reset env before each test
  });

  it("should be able to log to console in development mode", function() {
    Driftwood.debug("test"); 
    expect(last_console_message.indexOf("test") == -1).toBeFalsy();
  });

  it("should be *not* be able to log to console in production mode", function() {
    Driftwood.env("PRODUCTION")
    Driftwood.debug("test"); 
    expect(last_console_message.indexOf("test")).toEqual(-1);
  });

  it("Instances of logger should work the same as the static logger", function(){
    my_logger.env("production"); //Only problem
    my_logger.debug("instance logger : Should not see this");
    expect(last_console_message.indexOf("instance")).toEqual(-1); //We should not find the string
    my_logger.error("instance logger : should see this 999");
    expect(last_console_message.indexOf("999") == -1).toBeFalsy(); //We should find the string
  });


  it("Setting log level should work", function(){
    my_logger.env("development"); 
    my_logger.log_level("info"); //Should override
    my_logger.debug("instance logger : Should not see this");
    expect(last_console_message.indexOf("instance")).toEqual(-1); //We should not find the string
    my_logger.info("instance logger : should see this 1234");
    expect(last_console_message.indexOf("1234") == -1).toBeFalsy(); //We should find the string
    my_logger.error("instance logger : should see this 4567");
    expect(last_console_message.indexOf("4567") == -1).toBeFalsy(); //We should find the string
  });


});