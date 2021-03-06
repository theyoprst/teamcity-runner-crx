define(['tabinfo', 'properties/properties'], function(tabinfo, properties) {
  var prepareBuildXml_ = function(agentId, buildTypeId) {
    var elements = document.getElementById('run-build-form').elements;

    function buildOpenTag() {
      var result = '<build';
      var branch = elements['build-branch'].value.trim();
      if (branch.length > 0) {
        result += ' branchName="' + branch + '"';
      }
      if (elements['build-is-personal'].checked) {
        result += ' personal="true"';
      }
      result += '>';
      return result;
    }

    function buildTypeElement() {
      return '<buildType id="' + buildTypeId + '" />';
    }

    function commentElement() {
      var comment = elements['build-comment'].value.trim();
      if (comment.length === 0) {
        return '';
      }
      // TODO: htmlencode comment
      return '<comment><text>' + comment + '</text></comment>';
    }

    function triggeringOptionsElement() {
      var moveToTop = elements['build-move-to-top'].checked;
      var cleanAll = elements['build-clean-all'].checked;
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
  };
  return {
    triggerBuild: function(agentId) {
      tabinfo.teamcityOrigin(function(teamcityOrigin) {
        tabinfo.buildTypeId(function(buildTypeId) {
          var buildXml = prepareBuildXml_(agentId, buildTypeId);
          var url = teamcityOrigin + '/httpAuth/app/rest/buildQueue';
          var request = new XMLHttpRequest();
          request.addEventListener('load', function() {
            if (request.status == 200) {
              var rootElement = request.responseXML.documentElement;
              var webUrl = rootElement.getAttribute('webUrl');
              chrome.tabs.create({ url: webUrl });
              var branchName = document.getElementById('build-branch').value;
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
        });
      });
    }
  };
});
