define(['tabinfo'], function(tabinfo) {
  'strict';
  var Agents = function() {
    var agents = localStorage.getItem('agents');
    if (agents) {
      agents = JSON.parse(agents);
    } else {
      agents = {};
    }
    this.agents_ = agents;
  };
  Agents.prototype = {
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
    store_: function() {
      localStorage.setItem('agents', JSON.stringify(this.agents_));
    },
    getAgentIdByName: function(agentName, callback) {
      var thisRef = this;
      tabinfo.teamcityOrigin(function(teamcityOrigin) {
        if (!agentName) {
          callback(false, null);
          return;
        }
        var agentId = thisRef.agents_[agentName];
        if (agentId) {
          callback(false, agentId);
          return;
        }
        var request = new XMLHttpRequest();
        request.addEventListener('load', function() {
          if (request.status == 200) {
            var rootElement = request.responseXML.documentElement;
            var agentId = rootElement.getAttribute('id');
            thisRef.addAgent(agentName, agentId);
            callback(false, agentId);
          } else if (request.status == 404) {
            callback(true, none);
          } else {
            // TODO: inform user of something went wrong.
          }
        });
        var url = teamcityOrigin + '/httpAuth/app/rest/agents/' + agentName;
        request.open('GET', url, true);
        request.send();
      });
    }
  };
  return new Agents();
});
