/*!
 * Log.js
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * 
 * funciton addition of color decoration.
 * Copyright(c) 2013 Keiji Matsuzaki <futoase@gmail.com>
 *
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var clc = require('cli-color');
var EventEmitter = require('events').EventEmitter;

/**
 * Initialize a `Loggeer` with the given log `level` defaulting
 * to __DEBUG__ and `stream` defaulting to _stdout_.
 * 
 * @param {Object|String} setting 
 * @param {Object} stream 
 * @api public
 */

var Log = exports = module.exports = function Log(setting, stream){
  if (setting && 'string' == typeof setting){
    level = exports[setting.toUpperCase()];
  }
  if (setting && 'string' == typeof setting.level){
    level = exports[setting.level.toUpperCase()];
  }
  if ('undefined' == typeof setting){
    level = exports.DEBUG;
  }
  this.level = level;
  this.color = setting ? Boolean(setting.color) : false;
  this.date = setting ? Boolean(setting.date) : true;
  this.stream = stream || process.stdout;
  if (this.stream.readable) this.read();
};

/**
 * System is unusable.
 * 
 * @type Number
 */

exports.EMERGENCY = 0;

/**
 * Action must be taken immediately.
 * 
 * @type Number 
 */

exports.ALERT = 1;

/**
 * Critical condition.
 *
 * @type Number
 */

exports.CRITICAL = 2;

/**
 * Error condition.
 * 
 * @type Number
 */

exports.ERROR = 3;

/**
 * Warning condition.
 * 
 * @type Number
 */

exports.WARNING = 4;

/**
 * Normal but significant condition.
 * 
 * @type Number
 */

exports.NOTICE = 5;

/**
 * Purely informational message.
 * 
 * @type Number
 */

exports.INFO = 6;

/**
 * Application debug messages.
 * 
 * @type Number
 */

exports.DEBUG = 7;

/**
 * prototype.
 */ 

Log.prototype = {
  
  /**
   * Start emitting "line" events.
   *
   * @api public
   */
  
  read: function(){
    var buf = ''
      , self = this
      , stream = this.stream;

    stream.setEncoding('utf8');
    stream.on('data', function(chunk){
      buf += chunk;
      if ('\n' != buf[buf.length - 1]) return;
      buf.split('\n').map(function(line){
        if (!line.length) return;
        try {
          var captures = line.match(/^\[([^\]]+)\] (\w+) (.*)/);
          var obj = {
              date: new Date(captures[1])
            , level: exports[captures[2]]
            , levelString: captures[2]
            , msg: captures[3] 
          };
          self.emit('line', obj);
        } catch (err) {
          // Ignore
        }
      });
      buf = '';
    });

    stream.on('end', function(){
      self.emit('end');
    });
  },
  
  /**
   * Log output message.
   *
   * @param  {String} levelStr
   * @param  {Array} args
   * @api private
   */

  log: function(levelStr, args) {
    if (exports[levelStr] <= this.level) {
      var i = 1;
      var msg = args[0].replace(/%s/g, function(){
        return args[i++];
      });
      var now = new Date;
      if (this.color === true) {
        now = clc.yellow(now);
        levelStr = this.levelColor(levelStr);
      }
      this.stream.write(
          (this.date ? '[' + now + '] ' : '')
        + levelStr
        + ' ' + msg
        + '\n'
      );
    }
  },

  /**
   * Set color of Log level.
   *
   * @param {String} levelStr
   * @api private
   */

  levelColor: function(levelStr) {
    return {
      "NOTICE": clc.cyan,
      "INFO": clc.green,
      "ALERT": clc.yellowBright,
      "EMERGENCY": clc.magentaBright,
      "CRITICAL": clc.redBright,
      "ERROR": clc.red,
      "WARNING": clc.red,
      "DEBUG": clc.blue
    }[levelStr](levelStr);
  },

  /**
   * Log emergency `msg`.
   *
   * @param  {String} msg
   * @api public
   */

  emergency: function(msg){
    this.log('EMERGENCY', arguments);
  },

  /**
   * Log alert `msg`.
   *
   * @param  {String} msg
   * @api public
   */

  alert: function(msg){
    this.log('ALERT', arguments);
  },

  /**
   * Log critical `msg`.
   *
   * @param  {String} msg
   * @api public
   */

  critical: function(msg){
    this.log('CRITICAL', arguments);
  },

  /**
   * Log error `msg`.
   *
   * @param  {String} msg
   * @api public
   */

  error: function(msg){
    this.log('ERROR', arguments);
  },

  /**
   * Log warning `msg`.
   *
   * @param  {String} msg
   * @api public
   */

  warning: function(msg){
    this.log('WARNING', arguments);
  },

  /**
   * Log notice `msg`.
   *
   * @param  {String} msg
   * @api public
   */

  notice: function(msg){
    this.log('NOTICE', arguments);
  },

  /**
   * Log info `msg`.
   *
   * @param  {String} msg
   * @api public
   */ 

  info: function(msg){
    this.log('INFO', arguments);
  },

  /**
   * Log debug `msg`.
   *
   * @param  {String} msg
   * @api public
   */

  debug: function(msg){
    this.log('DEBUG', arguments);
  }
};

/**
 * Inherit from `EventEmitter`.
 */

Log.prototype.__proto__ = EventEmitter.prototype;
