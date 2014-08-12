define(function() {
  'strict';
  function Branches() {
    var branches = localStorage.getItem('branches');
    if (branches) {
      branches = JSON.parse(branches);
    } else {
      branches = {};
    }
    this.branches_ = branches;
  }
  Branches.prototype = {
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
  return new Branches();
});
