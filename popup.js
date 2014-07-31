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

(function() {
  'use strict';

  var buildType;
  var teamcityOrigin;
  var agents = new AgentsStorage();
  var branches = new BranchesStorage();

  function getJsonFromQuery(query) {
    var result = {};
    query.split('&').forEach(function(part) {
      var item = part.split('=');
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
  }

  function getBuildTypeFromUrl(url) {
    var splittedUrl = url.split('?', 2);
    var queryString = splittedUrl[1];
    var queryParams = getJsonFromQuery(queryString);
    if (queryParams.hasOwnProperty('buildTypeId')) {
      return queryParams.buildTypeId;
    } else {
      var buildType = queryParams.id;
      var prefix = 'buildType:';
      console.assert(buildType.indexOf(prefix) === 0);
      return buildType.substring(prefix.length);
    }
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

  document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs) {
      var currentUrl = tabs[0].url;
      buildType = getBuildTypeFromUrl(currentUrl);
      teamcityOrigin = getOriginUrl(currentUrl);
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
  });
}());
