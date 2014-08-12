define(['./base'], function(TeamcityProperty) {
  'strict';
  var TeamcitySelectProperty = function(propertyElement, typeValueElement) {
    TeamcityProperty.call(this, propertyElement, typeValueElement);
    console.assert(typeValueElement);
    if (typeValueElement) {
      this.data = [];
      for (var i = 0; i < typeValueElement.attributes.length; i++) {
        var attrib = typeValueElement.attributes[i];
        if (attrib.name.indexOf('data_') === 0) {
          var index = parseInt(attrib.name.substr('data_'.length), 10);
          this.data[index - 1] = attrib.value;
        }
      }
    }
  };
  TeamcitySelectProperty.prototype = Object.create(TeamcityProperty.prototype);
  TeamcitySelectProperty.prototype.constructor = TeamcitySelectProperty;
  TeamcitySelectProperty.prototype.createInput = function(cell) {
    this.select = document.createElement('select');
    this.select.value = this.value;
    for (var i = 0; i < this.data.length; i++) {
      var dataItem = this.data[i];
      var option = document.createElement('option');
      option.value = dataItem;
      option.text = dataItem;
      if (this.value == dataItem) {
        option.selected = 'selected';
      }
      this.select.appendChild(option);
    }
    cell.appendChild(this.select);
  };
  TeamcitySelectProperty.prototype.currentValue = function() {
    return this.select.options[this.select.selectedIndex].value;
  };
  return TeamcitySelectProperty;
});
