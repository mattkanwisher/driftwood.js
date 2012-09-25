// **Driftwood.js** is a super simple logging and exception tracking library for client side javascript. Works in all major browsers.
//
//[Driftwood on Github](https://github.com/errplane/driftwood.js)
//
//Matthew Kanwisher [Errplane Inc](http://errplane.com)  
//MIT License
//Copyright 2012 Errplane

// Driftwood namespace is a static namespace for logging, if you want instances of loggers do:
//
//		  var logger = new Driftwood.logger();


var Driftwood = new function() {

  this.logger  = function() {
	  var levels = ["DEBUG", "INFO", "ERROR", "EXCEPTION", "NONE"]
	  //Don't change the config directly. Instead use the helper methods below.
  	var config =  { 
	  		consoleLevel: "DEBUG", //This get changed if you change the environment
	  		consoleLevelId: 0,
	  		exceptionLevel: "NONE", //In dev you probably don't want to transmit exceptions to the server
	  		exceptionLevelId: 99,
	  		mode: "development", //This should either be development  or production
	  		serverPath: "/exceptions/notify?payload=",
	  		applicationName: "js_client" // this should be overriden by the user
	  	};
  	var findLevel = function(level) {
  		 return levels.indexOf(level.toUpperCase());
  	};
    function log(args, level, fn) {
  			var levelId = findLevel(level);
				var d=new Date();

  			if( levelId >= config.consoleLevelId ) {
  				args[0] =  level + ":" + "["  + ISODateString(d) + "] "  + args[0] ;
  			} 
  			if( levelId >= config.exceptionLevelId) {
  				this.transmit(args[0]);
  			}
  			fn.apply(console,  Array.prototype.slice.call(args));
  		};
  	return {
		  // Creates a notification URL
		  // Currently were not validating that urls are under 2048 charecters, so this could cause problems in IE.
		  // Will fix this in next rev
		  //While this function is technically supposed to be private, we still expose it so you can modify it.
		  _genExceptionUrl: function(error) {
		    var url = config.serverPath + encodeURIComponent(JSON.stringify(error));
		    return url;
		  },
		  //Generates the script tag, you could replace this implementation with one that loads images instead
		  _genScriptTag: function(src) {
 		    var script = document.createElement("script");
		    script.src = src;
		    document.body.appendChild(script);
			},
		  //While this function is technically supposed to be private, we still expose it so you can modify it.
	  	_createBlackBox: function(error) {
			 var blackBox =	{
		      "application_name": config.applicationName,
		      "message": error || "",
		      
		      // Request
		      "url": window.location.toString(),
		      "language":"javascript",
		      "custom_data": { 
			      "hostname": window.location.hostname,
			      "user_agent": navigator.userAgent || "",
			      "referrer": document.referrer || "",
			      "cookies": document.cookie || "",
			    },
		      "backtrace": this.getBackTrace(error),
		      "exception_class": "Javscript#Unknown" //TODO figure out what the class should be
		    }
	  		return blackBox;
	  	},
		  //Its safe to use this function with external servers since we do everything on the query string
  		setServerPath: function(murl) {
  			config.serverPath = murl; 
  		},
	  	env: function(menv) {
	  		if(menv.toLowerCase() == "development") {
	  			config.consoleLevel = "DEBUG";
	  			config.exceptionLevel = "none";
	  			config.consoleLevelId = 0;
	  			config.exceptionLevelId = 4;
	  		} else if(menv.toLowerCase() == "production") {
	  			config.consoleLevel = "ERROR";
	  			config.exceptionLevel = "none";
	  			config.consoleLevelId = 2;
	  			config.exceptionLevelId = 3;
	  		} else {
	  			console.log("Unknown environment level");
	  		}
	  	},
	  	applicationName: function(appname) {
	  		config.applicationName = appname;
	  	},
	  	logLevel: function(level) {
	  		var id = findLevel(level);
	  		if( id > -1 ) {
		  		config.consoleLevel = level.toUpperCase();
		  		config.consoleLevelId = id;
		  	} else {
		  		console.log("Setting an invalid log level: " + level);
		  	}
	  	},
	  	exceptionLevel: function(level) {
	  		var id = findLevel(level);
	  		if( id > -1 ) {
		  		config.exceptionLevel = level.toUpperCase();
		  		config.exceptionLevelId = id;
		  	} else {
		  		console.log("Setting an invalid log level: " + level);
		  	}
	  	},
  		//The actually function that sends the data to the server
			transmit: function(message, additionalData) {
			  var e = null;
			  if (typeof message === "object") {
			    e = message;
			    message = e.message;
			  }
			  
			  var error = this._createBlackBox(message, additionalData);		  
		    var src = this._genExceptionUrl(error);
		    this._genScriptTag(src);
			},
	  	debug: function() {
	  		this.log(arguments, "DEBUG", console.debug);
  		},
	  	info: function() {
	  		this.log(arguments, "INFO", console.info)
  		},
	  	error: function() {
	  		this.log(arguments, "ERROR", console.error);
  		},
  		exception: function() {
  			this.log(arguments, "EXCEPTION",console.error);
  		},
  		//You can pass an exception or string to this function
		  getBackTrace: function(message, url, line) {
		    var backTrace = ["no backtrace"];
		    if (typeof message === "object") {
		      backTrace = printStackTrace({"e": message});
		    } else {
		      backTrace = printStackTrace();
		    }
		    return backTrace;
		  }

  	}
  };		

  defaultLogger = new this.logger();
  this.exception = function() {
  	defaultLogger.exception(arguments);
  }  
  this.applicationName = function(appname){
  	defaultLogger.applicationName(appname);
  }

  //Convience methods around the logger to have a static instance
  this.debug = defaultLogger.debug;
  this.info = defaultLogger.info;
  this.error = defaultLogger.error;

  this.env = function(mode) {
  	defaultLogger.env(mode);
  };

  this.setServerPath = function(u) {
  	defaultLogger.setServerPath(u);
  };

 this.exceptionLevel =  function(level) {
 	defaultLogger.exceptionLevel(level);
  };

 this.logLevel =  function(level) {
 	defaultLogger.logLevel(level);
  };

};

// Global error handler
window.onerror = function(message, url, line) {
  Driftwood.exception(message, {"url": url, "line": line});
};
//Mozilla implementation of Array.indexOf, for IE < 9
//See http://stackoverflow.com/questions/143847/best-way-to-find-an-item-in-a-javascript-array
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(searchElement){"use strict";if(this===void 0||this===null)throw new TypeError();var t=Object(this);var len=t.length>>>0;if(len===0)return-1;var n=0;if(arguments.length>0){n=Number(arguments[1]);if(n!==n)n=0;else if(n!==0&&n!==(1/0)&&n!==-(1/0))n=(n>0||-1)*Math.floor(Math.abs(n))}if(n>=len)return-1;var k=n>=0?n:Math.max(len-Math.abs(n),0);for(;k<len;k++){if(k in t&&t[k]===searchElement)return k}return-1}}

//https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference:Global_Objects:Date
function ISODateString(d){function pad(n){return n<10?'0'+n:n}return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())+':'+pad(d.getUTCSeconds())+'Z'}

// JSON support for older browsers. Public domain.
// https://github.com/douglascrockford/JSON-js/blob/master/json2.js
var JSON;JSON||(JSON={}),function(){function f(a){return a<10?"0"+a:a}function quote(a){return escapable.lastIndex=0,escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b=="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,g=gap,h,i=b[a];i&&typeof i=="object"&&typeof i.toJSON=="function"&&(i=i.toJSON(a)),typeof rep=="function"&&(i=rep.call(b,a,i));switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";gap+=indent,h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1)h[c]=str(c,i)||"null";return e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]",gap=g,e}if(rep&&typeof rep=="object"){f=rep.length;for(c=0;c<f;c+=1)typeof rep[c]=="string"&&(d=rep[c],e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e))}else for(d in i)Object.prototype.hasOwnProperty.call(i,d)&&(e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));return e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}",gap=g,e}}"use strict",typeof Date.prototype.toJSON!="function"&&(Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;typeof JSON.stringify!="function"&&(JSON.stringify=function(a,b,c){var d;gap="",indent="";if(typeof c=="number")for(d=0;d<c;d+=1)indent+=" ";else typeof c=="string"&&(indent=c);rep=b;if(!b||typeof b=="function"||typeof b=="object"&&typeof b.length=="number")return str("",{"":a});throw new Error("JSON.stringify")}),typeof JSON.parse!="function"&&(JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e=="object")for(c in e)Object.prototype.hasOwnProperty.call(e,c)&&(d=walk(e,c),d!==undefined?e[c]=d:delete e[c]);return reviver.call(a,b,e)}var j;text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),typeof reviver=="function"?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}()

// Universal stack trace method. Public domain.
// https://raw.github.com/eriwen/javascript-stacktrace/master/stacktrace.js
function printStackTrace(a){a=a||{guess:!0};var b=a.e||null,c=!!a.guess,d=new printStackTrace.implementation,e=d.run(b);return c?d.guessAnonymousFunctions(e):e}printStackTrace.implementation=function(){},printStackTrace.implementation.prototype={run:function(a,b){return a=a||this.createException(),b=b||this.mode(a),b==="other"?this.other(arguments.callee):this[b](a)},createException:function(){try{this.undef()}catch(a){return a}},mode:function(a){return a.arguments&&a.stack?"chrome":typeof a.message=="string"&&typeof window!="undefined"&&window.opera?a.stacktrace?a.message.indexOf("\n")>-1&&a.message.split("\n").length>a.stacktrace.split("\n").length?"opera9":a.stack?a.stacktrace.indexOf("called from line")<0?"opera10b":"opera11":"opera10a":"opera9":a.stack?"firefox":"other"},instrumentFunction:function(a,b,c){a=a||window;var d=a[b];a[b]=function(){return c.call(this,printStackTrace().slice(4)),a[b]._instrumented.apply(this,arguments)},a[b]._instrumented=d},deinstrumentFunction:function(a,b){a[b].constructor===Function&&a[b]._instrumented&&a[b]._instrumented.constructor===Function&&(a[b]=a[b]._instrumented)},chrome:function(a){var b=(a.stack+"\n").replace(/^\S[^\(]+?[\n$]/gm,"").replace(/^\s+(at eval )?at\s+/gm,"").replace(/^([^\(]+?)([\n$])/gm,"{anonymous}()@$1$2").replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm,"{anonymous}()@$1").split("\n");return b.pop(),b},firefox:function(a){return a.stack.replace(/(?:\n@:0)?\s+$/m,"").replace(/^\(/gm,"{anonymous}(").split("\n")},opera11:function(a){var b="{anonymous}",c=/^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/,d=a.stacktrace.split("\n"),e=[];for(var f=0,g=d.length;f<g;f+=2){var h=c.exec(d[f]);if(h){var i=h[4]+":"+h[1]+":"+h[2],j=h[3]||"global code";j=j.replace(/<anonymous function: (\S+)>/,"$1").replace(/<anonymous function>/,b),e.push(j+"@"+i+" -- "+d[f+1].replace(/^\s+/,""))}}return e},opera10b:function(a){var b="{anonymous}",c=/^(.*)@(.+):(\d+)$/,d=a.stacktrace.split("\n"),e=[];for(var f=0,g=d.length;f<g;f++){var h=c.exec(d[f]);if(h){var i=h[1]?h[1]+"()":"global code";e.push(i+"@"+h[2]+":"+h[3])}}return e},opera10a:function(a){var b="{anonymous}",c=/Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,d=a.stacktrace.split("\n"),e=[];for(var f=0,g=d.length;f<g;f+=2){var h=c.exec(d[f]);if(h){var i=h[3]||b;e.push(i+"()@"+h[2]+":"+h[1]+" -- "+d[f+1].replace(/^\s+/,""))}}return e},opera9:function(a){var b="{anonymous}",c=/Line (\d+).*script (?:in )?(\S+)/i,d=a.message.split("\n"),e=[];for(var f=2,g=d.length;f<g;f+=2){var h=c.exec(d[f]);h&&e.push(b+"()@"+h[2]+":"+h[1]+" -- "+d[f+1].replace(/^\s+/,""))}return e},other:function(a){var b="{anonymous}",c=/function\s*([\w\-$]+)?\s*\(/i,d=[],e,f,g=10;while(a&&a.arguments&&d.length<g)e=c.test(a.toString())?RegExp.$1||b:b,f=Array.prototype.slice.call(a.arguments||[]),d[d.length]=e+"("+this.stringifyArguments(f)+")",a=a.caller;return d},stringifyArguments:function(a){var b=[],c=Array.prototype.slice;for(var d=0;d<a.length;++d){var e=a[d];e===undefined?b[d]="undefined":e===null?b[d]="null":e.constructor&&(e.constructor===Array?e.length<3?b[d]="["+this.stringifyArguments(e)+"]":b[d]="["+this.stringifyArguments(c.call(e,0,1))+"..."+this.stringifyArguments(c.call(e,-1))+"]":e.constructor===Object?b[d]="#object":e.constructor===Function?b[d]="#function":e.constructor===String?b[d]='"'+e+'"':e.constructor===Number&&(b[d]=e))}return b.join(",")},sourceCache:{},ajax:function(a){var b=this.createXMLHTTPObject();if(b)try{return b.open("GET",a,!1),b.notify(null),b.responseText}catch(c){}return""},createXMLHTTPObject:function(){var a,b=[function(){return new XMLHttpRequest},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}];for(var c=0;c<b.length;c++)try{return a=b[c](),this.createXMLHTTPObject=b[c],a}catch(d){}},isSameDomain:function(a){return a.indexOf(location.hostname)!==-1},getSource:function(a){return a in this.sourceCache||(this.sourceCache[a]=this.ajax(a).split("\n")),this.sourceCache[a]},guessAnonymousFunctions:function(a){for(var b=0;b<a.length;++b){var c=/\{anonymous\}\(.*\)@(.*)/,d=/^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,e=a[b],f=c.exec(e);if(f){var g=d.exec(f[1]);if(g){var h=g[1],i=g[2],j=g[3]||0;if(h&&this.isSameDomain(h)&&i){var k=this.guessAnonymousFunction(h,i,j);a[b]=e.replace("{anonymous}",k)}}}}return a},guessAnonymousFunction:function(a,b,c){var d;try{d=this.findFunctionName(this.getSource(a),b)}catch(e){d="getSource failed with url: "+a+", exception: "+e.toString()}return d},findFunctionName:function(a,b){var c=/function\s+([^(]*?)\s*\(([^)]*)\)/,d=/['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/,e=/['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/,f="",g,h=Math.min(b,20),i,j;for(var k=0;k<h;++k){g=a[b-k-1],j=g.indexOf("//"),j>=0&&(g=g.substr(0,j));if(g){f=g+f,i=d.exec(f);if(i&&i[1])return i[1];i=c.exec(f);if(i&&i[1])return i[1];i=e.exec(f);if(i&&i[1])return i[1]}}return"(?)"}};


