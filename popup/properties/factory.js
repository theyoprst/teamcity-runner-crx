define(
    ['./base', './text', './checkbox', './select', './password'],
    function(TeamcityProperty, TeamcityTextProperty, TeamcityCheckboxProperty,
             TeamcitySelectProperty, TeamcityPasswordProperty) {
      'strict';
      function teamcityPropertyFactory(propertyElement) {
        var type = 'text';
        var typeValueElement;
        if (propertyElement.children.length > 0) {
          console.assert(propertyElement.children.length == 1);
          var typeElement = propertyElement.children[0];
          var rawValue = typeElement.getAttribute('rawValue');
          // "type attr1='value 1' attr2='value 2' ... "
          var xml = '<' + rawValue.replace('<', '&lt;').replace('>', '&gt;') + '/>';
          xml = xml.replace(/\|(.)/g, function(match, p1){
            return '&#' + p1.charCodeAt(0) + ';';
          });
          console.log('xml = ' + xml);
          var parser = new DOMParser();
          typeValueElement = parser.parseFromString(xml, 'text/xml').documentElement;
          type = typeValueElement.tagName;
        }
        var teamcityPropertyClass = TeamcityProperty;
        if (type == 'text')
          teamcityPropertyClass = TeamcityTextProperty;
        else if (type == 'checkbox')
          teamcityPropertyClass = TeamcityCheckboxProperty;
        else if (type == 'select')
          teamcityPropertyClass = TeamcitySelectProperty;
        else if (type == 'password')
          teamcityPropertyClass = TeamcityPasswordProperty;
        else
          console.assert(false, 'Invalid type "' + type + '"');
        return new teamcityPropertyClass(propertyElement, typeValueElement);
      }
      return teamcityPropertyFactory;
    });
