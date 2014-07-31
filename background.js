chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    var cssConditions = ['a.feedbackLink[href*="jetbrains.com/teamcity"]'];
    var queryNeedles = ['buildTypeId=', 'id=buildType:'];
    var conditions = queryNeedles.map(function(queryNeedle){
      return new chrome.declarativeContent.PageStateMatcher({
        css: cssConditions,
        pageUrl: {queryContains:queryNeedle}
      });
    });
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: conditions,
      actions: [new chrome.declarativeContent.ShowPageAction() ]
    }]);
  });
});
