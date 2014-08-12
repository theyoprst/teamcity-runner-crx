define(['./base'], function(TeamcityProperty) {
  'strict';
  var TeamcityCheckboxProperty = function(propertyElement, typeValueElement) {
    TeamcityProperty.call(this, propertyElement, typeValueElement);
    this.checkedValue = typeValueElement.getAttribute('checkedValue');
    this.uncheckedValue = typeValueElement.getAttribute('uncheckedValue');
  };
  TeamcityCheckboxProperty.prototype = Object.create(TeamcityProperty.prototype);
  TeamcityCheckboxProperty.prototype.constructor = TeamcityCheckboxProperty;
  TeamcityCheckboxProperty.prototype.createInput = function(cell) {
    this.input = document.createElement('input');
    this.input.type = 'checkbox';
    cell.appendChild(this.input);
  };
  TeamcityCheckboxProperty.prototype.currentValue = function() {
    var v = this.input.checked ? this.checkedValue : this.uncheckedValue;
    return v || '';
  };
  return TeamcityCheckboxProperty;
});
