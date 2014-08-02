(function() {
  var buttons = Array.prototype.slice.call(
    document.getElementsByTagName('button'));
  var buildTypes = buttons.map(function(button){
    var match = button.outerHTML.match(/runCustomBuild\('([^']+)',/);
    if (match === null) {
      return null;
    }
    return match[1];
  });
  buildTypes = buildTypes.filter(function(bt){
    return bt !== null;
  });
  console.log(buildTypes);
  return buildTypes;
}());
