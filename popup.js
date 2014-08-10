function AgentsStorage() {
  var agents = localStorage.getItem('agents');
  if (agents) {
    agents = JSON.parse(agents);
  } else {
    agents = {};
  }
  this.agents_ = agents;
}

AgentsStorage.prototype = {
  requestSuggestions: function(needle, callback) {
    var suggestions = Object.keys(this.agents_).filter(function(agent) {
      return needle.length > 0 && agent.indexOf(needle) === 0;
    });
    callback(suggestions.sort());
  },

  addAgent: function(agentName, agentId) {
    this.agents_[agentName] = agentId;
    this.store_();
  },

  getAgentIdByName: function(agentName) {
    return this.agents_[agentName];
  },

  store_: function() {
    localStorage.setItem('agents', JSON.stringify(this.agents_));
  }
};

function BranchesStorage() {
  var branches = localStorage.getItem('branches');
  if (branches) {
    branches = JSON.parse(branches);
  } else {
    branches = {};
  }
  this.branches_ = branches;
}

BranchesStorage.prototype = {
  requestSuggestions: function(needle, callback) {
    var suggestions = Object.keys(this.branches_).filter(function(branch) {
      return needle.length > 0 && branch.indexOf(needle) === 0;
    });
    callback(suggestions.sort());
  },

  addBranch: function(branchName) {
    this.branches_[branchName] = true;
    this.store_();
  },

  store_: function() {
    localStorage.setItem('branches', JSON.stringify(this.branches_));
  }
};

function TeamcityPropertyFactory(propertyElement) {
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

function TeamcityProperty(propertyElement, typeValueElement) {
  this.name = propertyElement.getAttribute('name');
  this.value = propertyElement.getAttribute('value');
  if (typeValueElement) {
    this.description = typeValueElement.getAttribute('description');
    this.display = typeValueElement.getAttribute('display');
    this.label = typeValueElement.getAttribute('label');
  }
}

TeamcityProperty.prototype = {
  populateRow: function(row) {
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    cell0.innerHTML = this.label || this.name;
    this.createInput(cell1);
  }
};

function TeamcityTextProperty(propertyElement, typeValueElement) {
  TeamcityProperty.call(this, propertyElement, typeValueElement);
  if (typeValueElement) {
    this.validationMode = typeValueElement.getAttribute('validationMode');
  }
}
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

function TeamcitySelectProperty(propertyElement, typeValueElement) {
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
}
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

function TeamcityCheckboxProperty(propertyElement, typeValueElement) {
  TeamcityProperty.call(this, propertyElement, typeValueElement);
  this.checkedValue = typeValueElement.getAttribute('checkedValue');
  this.uncheckedValue = typeValueElement.getAttribute('uncheckedValue');
}
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

function TeamcityProperties() {
  this.shown = false;
  this.properties = null;
}

TeamcityProperties.prototype = {
  showProgress: function() {
    document.getElementById('expand-params-progress').style.display = 'block';
  },
  hideProgress: function() {
    document.getElementById('expand-params-progress').style.display = 'none';
  },
  setPropertiesDisplay: function(displayValue) {
    var rows = document.getElementsByClassName('teamcity-property-row');
    for (var i = 0, l = rows.length; i < l; i++) {
      rows[i].style.display = displayValue;
    }
  },
  showProperties: function() {
    this.setPropertiesDisplay('');
    this.shown = true;
  },
  hideProperties: function() {
    this.setPropertiesDisplay('none');
    this.shown = false;
  },
  fetchProperties: function(fetchBuildTypeDetails, callback) {
    var that = this;
    fetchBuildTypeDetails(function(rootElement) {
      var parameters = rootElement.getElementsByTagName('parameters')[0];
      that.properties = Array.prototype.slice.call(parameters.children);
      that.properties = that.properties.map(TeamcityPropertyFactory).filter(
          function(property) {
            return property.display != 'hidden';
          });
      console.log(that.properties);
      var expandParamsRow = document.getElementById('expand-params-row');
      var table = document.getElementById('parameters');
      var rowIndex = expandParamsRow.rowIndex;
      that.properties.map(function(property) {
        rowIndex += 1;
        var row = table.insertRow(rowIndex);
        row.className = 'teamcity-property-row';
        property.populateRow(row);
      });
      callback();
    });
  },
  expand: function(disableCallback, enableCallback, fetchBuildTypeDetails) {
    if (this.properties === null) {
      disableCallback();
      this.showProgress();
      var that = this;
      this.fetchProperties(fetchBuildTypeDetails, function() {
        this.shown = true;
        that.hideProgress();
        enableCallback();
      });
    } else if (this.shown) {
      this.hideProperties();
    } else {
      this.showProperties();
    }
  },
  collapse: function() {
    this.hideProperties();
  },
  toggle: function(disableCallback, enableCallback, fetchBuildTypeDetails) {
    if (!this.shown) {
      this.expand(disableCallback, enableCallback, fetchBuildTypeDetails);
    } else {
      this.collapse();
    }
  },
  valuesElement: function() {
    if (this.properties === null) {
      return '';
    }
    var result = '<properties>';
    for (var i = 0, len = this.properties.length; i < len; i++) {
      result += '<property ';
      var property = this.properties[i];
      result += 'name="' + property.name + '" ';
      result += 'value="' + property.currentValue() + '" ';
      result += '/>';
    }
    result += '</properties>';
    return result;
  }
};

(function() {
  'use strict';

  var buildType;
  var teamcityOrigin;
  var agents = new AgentsStorage();
  var branches = new BranchesStorage();
  var properties = new TeamcityProperties();

  function getJsonFromQuery(query) {
    var result = {};
    query.split('&').forEach(function(part) {
      var item = part.split('=');
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
  }

  // Returns protocol + host + optional port.
  // Given uri = "http://www.google.com/", origin == "http://www.google.com"
  function getOriginUrl(uri) {
    return uri.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];
  }

  function disableTheForm() {
    var form = document.getElementById('runBuildForm');
    for (var i = 0, len = form.elements.length; i < len; ++i) {
      form.elements[i].disabled = true;
    }
  }

  function enableTheForm() {
    var form = document.getElementById('runBuildForm');
    for (var i = 0, len = form.elements.length; i < len; ++i) {
      form.elements[i].disabled = false;
    }
  }

  function showInProgress() {
    document.getElementById('runBuildProgress').style.display = 'block';
  }

  function hideInProgress() {
    document.getElementById('runBuildProgress').style.display = 'none';
  }

  function prepareBuildXml(agentId) {
    var elements = document.getElementById('runBuildForm').elements;

    function buildOpenTag() {
      var result = '<build';
      var branch = elements.build_branch.value.trim();
      if (branch.length > 0) {
        result += ' branchName="' + branch + '"';
      }
      if (elements.build_is_personal.checked) {
        result += ' personal="true"';
      }
      result += '>';
      return result;
    }

    function buildTypeElement() {
      return '<buildType id="' + buildType + '" />';
    }

    function commentElement() {
      var comment = elements.build_comment.value.trim();
      if (comment.length === 0) {
        return '';
      }
      // TODO: htmlencode comment
      return '<comment><text>' + comment + '</text></comment>';
    }

    function triggeringOptionsElement() {
      var moveToTop = elements.build_move_to_top.checked;
      var cleanAll = elements.build_clean_all.checked;
      var result = '<triggeringOptions';
      if (cleanAll) {
        result += ' cleanSources="true"';
      }
      if (moveToTop) {
        result += ' queueAtTop="true"';
      }
      result += ' />';
      return result;
    }

    function agentElement() {
      return agentId ? ('<agent id="' + agentId + '"/>') : '';
    }

    function buildCloseTag() {
      return '</build>';
    }

    return buildOpenTag() +
        buildTypeElement() +
        commentElement() +
        triggeringOptionsElement() +
        agentElement() +
        properties.valuesElement() +
        buildCloseTag();
  }

  function runBuild(agentId) {
    var buildXml = prepareBuildXml(agentId);
    var url = teamcityOrigin + '/httpAuth/app/rest/buildQueue';
    var request = new XMLHttpRequest();
    request.addEventListener('load', function() {
      if (request.status == 200) {
        var rootElement = request.responseXML.documentElement;
        var webUrl = rootElement.getAttribute('webUrl');
        chrome.tabs.create({ url: webUrl });
        var branchName = document.getElementById('build_branch').value;
        if (branchName) {
          branches.addBranch(branchName);
        }
      } else {
        console.log(request);
      }
    });
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/xml');
    request.send(buildXml);
  }

  function findAgentId(callback) {
    var agent = document.getElementById('runBuildForm').elements.build_agent;
    var agentName = agent.value;
    if (!agentName) {
      callback(null);
      return;
    }
    var agentId = agents.getAgentIdByName(agentName);
    if (agentId) {
      callback(agentId);
      return;
    }
    var request = new XMLHttpRequest();
    request.addEventListener('load', function() {
      if (request.status == 200) {
        var rootElement = request.responseXML.documentElement;
        var agentId = rootElement.getAttribute('id');
        agents.addAgent(agentName, agentId);
        callback(agentId);
      } else if (request.status == 404) {
        showInvalidAgentError();
        enableTheForm();
        hideInProgress();
        agent.focus();
      } else {
        // TODO: inform user of something went wrong.
      }
    });
    var url = teamcityOrigin + '/httpAuth/app/rest/agents/' + agentName;
    request.open('GET', url, true);
    request.send();
  }

  function showInvalidAgentError() {
    document.getElementById('invalidAgent').style.display = 'block';
  }

  function onSubmit(event) {
    disableTheForm();
    showInProgress();
    findAgentId(runBuild);
    event.preventDefault();
  }

  function fetchBuildTypeDetails(callback) {
    var request = new XMLHttpRequest();
    request.addEventListener('load', function() {
      if (request.status == 200) {
        callback(request.responseXML.documentElement);
      } else {
        console.log(request);
        // TODO: inform user of something went wrong.
      }
    });
    var url = teamcityOrigin + '/httpAuth/app/rest/buildTypes/id:' + buildType;
    request.open('GET', url, true);
    request.send();
  }

  document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs) {
      var tab = tabs[0];
      var currentUrl = tab.url;
      teamcityOrigin = getOriginUrl(currentUrl);
      chrome.tabs.executeScript(
          tab.id, {file: 'buildtypes.js'},
          function(results) {
            console.assert(results.length == 1);
            var buildTypes = results[0];
            console.assert(buildTypes.length == 1);
            buildType = buildTypes[0];
            console.assert(buildType.length > 0);
          }
      );
    });
    var agentElem = document.getElementById('build_agent');
    new AutoSuggestControl(agentElem, agents);
    agentElem.addEventListener('change', function() {
      document.getElementById('invalidAgent').style.display = 'none';
    }, false);
    var branchElem = document.getElementById('build_branch');
    new AutoSuggestControl(branchElem, branches);
    document.getElementById('runBuildForm').addEventListener(
        'submit', onSubmit);
    var expandParamsElem = document.getElementById('expand-params');
    expandParamsElem.addEventListener('click', function() {
      properties.toggle(disableTheForm, enableTheForm, fetchBuildTypeDetails);
    });
  });
}());
