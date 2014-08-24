define([], function() {
  var slice = Array.prototype.slice;
  return {
    memoize: function(func) {
      var cache = {};
      return function() {
        var args = slice.call(arguments);
        var key = JSON.stringify(args);
        if (key in cache) {
          return cache[key];
        } else {
          var result = func.apply(this, args);
          cache[key] = result;
          return result;
        }
      };
    },
    memoizeAsync: function(func) {
      var cache = {};
      return function() {
        var args = slice.call(arguments);
        console.assert(args.length > 0);
        var callback = args.pop();
        var key = JSON.stringify(args);
        if (key in cache) {
          callback(cache[key]);
        } else {
          var newCallback = function(result) {
            cache[key] = result;
            callback(result);
          };
          args.push(newCallback);
          func.apply(this, args);
        }
      };
    }
  };
});
