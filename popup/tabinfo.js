define(function() {
  'use strict';

  var tab_ = null;
  var teamcityOrigin_ = null;
  var buildTypeId_ = null;
  var buildTypeDetails_ = null;
  var getOriginUrl_ = function(uri) {
    return uri.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];
  };
  var currentTab = function(callback) {
    if (tab_ === null) {
      chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      }, function(tabs) {
        callback(tabs[0]);
      });
    } else {
      callback(tab_);
    }
  };
  var teamcityOrigin = function(callback) {
    if (teamcityOrigin_ === null) {
      currentTab(function(tab) {
        teamcityOrigin_ = getOriginUrl_(tab.url);
        callback(teamcityOrigin_);
      });
    } else {
      callback(teamcityOrigin_);
    }
  };
  var buildTypeId = function(callback) {
    if (buildTypeId_ === null) {
      currentTab(function(tab) {
        chrome.tabs.executeScript(
          tab.id, {file: 'content/buildtypes.js'},
          function(results) {
              console.assert(results.length == 1);
              var buildTypes = results[0];
              console.assert(buildTypes.length == 1);
              buildTypeId_ = buildTypes[0];
              console.assert(buildTypeId_.length > 0);
              callback(buildTypeId_);
            }
        );
      });
    } else {
      callback(buildTypeId_);
    }
  };
  var buildTypeDetails = function(callback) {
    if (buildTypeDetails_ === null) {
      teamcityOrigin(function(teamcityOrigin) {
        buildTypeId(function(buildTypeId) {
          var request = new XMLHttpRequest();
          request.addEventListener('load', function() {
            if (request.status == 200) {
              callback(request.responseXML.documentElement);
            } else {
              console.log(request);
            }
          });
          var url = teamcityOrigin + '/httpAuth/app/rest/buildTypes/id:' + buildTypeId;
          request.open('GET', url, true);
          request.send();
        });
      });
    } else {
      callback(buildTypeDetails);
    }
  };
  return {
    teamcityOrigin: teamcityOrigin,
    buildTypeId: buildTypeId,
    buildTypeDetails: buildTypeDetails
  };
});
