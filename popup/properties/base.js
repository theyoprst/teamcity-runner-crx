define(function() {
  'strict';
  var TeamcityProperty = function(propertyElement, typeValueElement) {
    this.name = propertyElement.getAttribute('name');
    this.value = propertyElement.getAttribute('value');
    if (typeValueElement) {
      this.description = typeValueElement.getAttribute('description');
      this.display = typeValueElement.getAttribute('display');
      this.label = typeValueElement.getAttribute('label');
    }
  };
  TeamcityProperty.prototype = {
    populateRow: function(row) {
      var cell0 = row.insertCell(0);
      cell0.className = 'property-name';
      var cell1 = row.insertCell(1);
      var name = this.label || this.name;
      if (this.display == 'prompt') {
        name += '<span class="mandatory-asterix">*</span>';
      }
      cell0.innerHTML = name;
      this.createInput(cell1);
      if (this.description) {
        var desc = document.createElement('div');
        desc.innerHTML = this.description;
        desc.className = 'property-description';
        cell1.appendChild(desc);
      }
    }
  };
  return TeamcityProperty;
});
