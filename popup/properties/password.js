define(['./base'], function(TeamcityProperty) {
  function TeamcityPasswordProperty(propertyElement, typeValueElement) {
    TeamcityProperty.call(this, propertyElement, typeValueElement);
    if (typeValueElement) {
      this.validationMode = typeValueElement.getAttribute('validationMode');
    }
  }
  TeamcityPasswordProperty.prototype = Object.create(TeamcityProperty.prototype);
  TeamcityPasswordProperty.prototype.constructor = TeamcityPasswordProperty;
  TeamcityPasswordProperty.prototype.createInput = function(cell) {
    this.input = document.createElement('input');
    this.input.type = 'password';
    this.input.value = this.value;
    cell.appendChild(this.input);
  };
  TeamcityPasswordProperty.prototype.currentValue = function() {
    return this.input.value;
  };
  return TeamcityPasswordProperty;
});
