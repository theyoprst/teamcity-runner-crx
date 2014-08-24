define(['util/memoize'], function(memoize) {
  'use strict';

  var getOriginUrl_ = function(uri) {
    return uri.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];
  };
  var currentTab = memoize.memoizeAsync(function(callback) {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, function(tabs) {
      callback(tabs[0]);
    });
  });
  var teamcityOrigin = memoize.memoizeAsync(function(callback) {
    currentTab(function(tab) {
      callback(getOriginUrl_(tab.url));
    });
  });
  var buildTypeId = memoize.memoizeAsync(function(callback) {
    currentTab(function(tab) {
      chrome.tabs.executeScript(
        tab.id, {file: 'content/buildtypes.js'},
        function(results) {
            console.assert(results.length == 1);
            var buildTypes = results[0];
            console.assert(buildTypes.length == 1);
            var buildTypeId_ = buildTypes[0];
            console.assert(buildTypeId_.length > 0);
            callback(buildTypeId_);
          }
      );
    });
  });
  var buildTypeDetails = memoize.memoizeAsync(function(callback) {
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
  });
  return {
    teamcityOrigin: teamcityOrigin,
    buildTypeId: buildTypeId,
    buildTypeDetails: buildTypeDetails
  };
});
