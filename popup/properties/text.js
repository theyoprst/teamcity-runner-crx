define(['./base'], function(TeamcityProperty) {
  'strict';
  var TeamcityTextProperty = function(propertyElement, typeValueElement) {
    TeamcityProperty.call(this, propertyElement, typeValueElement);
    if (typeValueElement) {
      this.validationMode = typeValueElement.getAttribute('validationMode');
    }
  };
  TeamcityTextProperty.prototype = Object.create(TeamcityProperty.prototype);
  TeamcityTextProperty.prototype.constructor = TeamcityTextProperty;
  TeamcityTextProperty.prototype.createInput = function(cell) {
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.value = this.value;
    cell.appendChild(this.input);
  };
  TeamcityTextProperty.prototype.currentValue = function() {
    return this.input.value;
  };
  return TeamcityTextProperty;
});
