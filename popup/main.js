require.config({
  baseUrl: '../popup',
  paths: {
  }
});

require(['../lib/domReady', 'suggest', 'agents', 'branches',
         'properties/properties', 'trigger'],
        function(domReady, Suggest, agents, branches, properties, trigger) {
  'strict';
  var disableTheForm = function() {
    var form = document.getElementById('runBuildForm');
    for (var i = 0, len = form.elements.length; i < len; ++i) {
      form.elements[i].disabled = true;
    }
  };
  var enableTheForm = function() {
    var form = document.getElementById('runBuildForm');
    for (var i = 0, len = form.elements.length; i < len; ++i) {
      form.elements[i].disabled = false;
    }
  };
  var showInProgress = function() {
    document.getElementById('runBuildProgress').style.display = 'block';
  };
  var hideInProgress = function() {
    document.getElementById('runBuildProgress').style.display = 'none';
  };
  var showInvalidAgentError = function() {
    document.getElementById('invalidAgent').style.display = 'block';
  };
  var hideInvalidAgentError = function() {
    document.getElementById('invalidAgent').style.display = 'none';
  };
  var findAgentId = function(callback) {
    var agent = document.getElementById('runBuildForm').elements.build_agent;
    agents.getAgentIdByName(agent.value, function(isInvalid, agentId) {
      if (isInvalid) {
        showInvalidAgentError();
        enableTheForm();
        hideInProgress();
        agent.focus();
      } else {
        callback(agentId);
      }
    });
  };
  var onSubmit = function(event) {
    disableTheForm();
    showInProgress();
    findAgentId(trigger.triggerBuild);
    event.preventDefault();
  };
  domReady(function() {
    var agentElem = document.getElementById('build_agent');
    new Suggest(agentElem, agents);
    agentElem.addEventListener('change', function() {
      document.getElementById('invalidAgent').style.display = 'none';
    }, false);

    var branchElem = document.getElementById('build_branch');
    new Suggest(branchElem, branches);

    document.getElementById('runBuildForm').addEventListener(
        'submit', onSubmit);

    var expandParamsElem = document.getElementById('expand-params');
    expandParamsElem.addEventListener('click', function() {
      properties.toggle(disableTheForm, enableTheForm);
    });
  });
});
