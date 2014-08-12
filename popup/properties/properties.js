define(['tabinfo', './factory'], function(tabinfo, teamcityPropertyFactory) {
  'strict';
  var shown_ = false;
  var properties_ = null;
  var showProgress_ = function() {
    document.getElementById('expand-params-progress').style.display = 'block';
  };
  var hideProgress_ = function() {
    document.getElementById('expand-params-progress').style.display = 'none';
  };
  var setPropertiesDisplay_ = function(displayValue) {
    var rows = document.getElementsByClassName('teamcity-property-row');
    for (var i = 0, l = rows.length; i < l; i++) {
      rows[i].style.display = displayValue;
    }
  };
  var showProperties_ = function() {
    setPropertiesDisplay_('');
    shown_ = true;
  };
  var hideProperties_ = function() {
    setPropertiesDisplay_('none');
    shown_ = false;
  };
  var fetchProperties_ = function(callback) {
    tabinfo.buildTypeDetails(function(rootElement) {
      var parameters = rootElement.getElementsByTagName('parameters')[0];
      properties_ = Array.prototype.slice.call(parameters.children);
      properties_ = properties_.map(teamcityPropertyFactory).filter(
          function(property) {
            return property.display != 'hidden';
          });
      console.log(properties_);
      var expandParamsRow = document.getElementById('expand-params-row');
      var table = document.getElementById('parameters');
      var rowIndex = expandParamsRow.rowIndex;
      properties_.map(function(property) {
        rowIndex += 1;
        var row = table.insertRow(rowIndex);
        row.className = 'teamcity-property-row';
        property.populateRow(row);
      });
      callback();
    });
  };
  var expand_ = function(disableCallback, enableCallback) {
    if (properties_ === null) {
      disableCallback();
      showProgress_();
      fetchProperties_(function() {
        shown_ = true;
        hideProgress_();
        enableCallback();
      });
    } else if (shown_) {
      hideProperties_();
    } else {
      showProperties_();
    }
  };
  var collapse_ = function() {
    hideProperties_();
  };
  var toggle = function(disableCallback, enableCallback) {
    if (!shown_) {
      expand_(disableCallback, enableCallback);
    } else {
      collapse_();
    }
  };
  var valuesElement = function() {
    if (properties_ === null) {
      return '';
    }
    var result = '<properties>';
    for (var i = 0, len = properties_.length; i < len; i++) {
      result += '<property ';
      var property = properties_[i];
      result += 'name="' + property.name + '" ';
      result += 'value="' + property.currentValue() + '" ';
      result += '/>';
    }
    result += '</properties>';
    return result;
  };
  return {
    toggle: toggle,
    valuesElement: valuesElement
  };
});
