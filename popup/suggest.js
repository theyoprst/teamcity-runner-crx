define(function() {
  'strict';
  /**
   * @constructor
   * @param {!HTMLInputElement} textbox
   */
  var Suggest = function(textbox, provider) {
    /**
     * @private
     * @type {number}
     */
    this.selectedIndex_ = -1;

    /**
     * @private
     * @type {Node}
     */
    this.dropdownLayer_ = null;

    /** @private */
    this.provider_ = provider;

    /**
     * @private
     * @type {!HTMLInputElement}
     */
    this.textbox_ = textbox;

    /** @private */
    this.initTextbox_();
  };

  /** @private */
  Suggest.prototype.initTextbox_ = function() {
    var thisRef = this;
    this.textbox_.addEventListener('keyup', function(event) {
      thisRef.handleKeyUp_(event);
    });
    this.textbox_.addEventListener('keydown', function(event) {
      thisRef.handleKeyDown_(event);
    });
    this.textbox_.addEventListener('blur', function(event) {
      thisRef.hideSuggestions_();
    });
    this.createDropDown_();
  };

  /** @private */
  Suggest.prototype.createDropDown_ = function() {
    this.dropdownLayer_ = document.createElement('div');
    this.dropdownLayer_.className = 'suggestions';
    this.dropdownLayer_.style.visibility = 'hidden';
    this.dropdownLayer_.style.width = this.textbox_.offsetWidth + 'px';
    var thisRef = this;
    this.dropdownLayer_.addEventListener('mousedown', function(event) {
      thisRef.textbox_.value = event.target.firstChild.nodeValue;
      thisRef.hideSuggestions_();
      event.preventDefault();  // In order not to lose focus.
    });
    this.dropdownLayer_.addEventListener('mouseover', function(event) {
      thisRef.highlightSuggestion_(event.target);
    });
    document.body.appendChild(this.dropdownLayer_);
  };

  /**
   * @private
   * @param {Array.<string>} suggestions
   */
  Suggest.prototype.setSuggestions_ = function(suggestions) {
    if (suggestions.length > 0) {
      this.showSuggestions_(suggestions);
    } else {
      this.hideSuggestions_();
    }
  };

  /**
   * @private
   * @param {Array.<string>} suggestions
   */
  Suggest.prototype.showSuggestions_ = function(suggestions) {
    this.selectedIndex_ = -1;
    this.dropdownLayer_.innerHTML = '';
    for (var i = 0; i < suggestions.length; i++) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(suggestions[i]));
      this.dropdownLayer_.appendChild(div);
    }
    this.dropdownLayer_.style.left = this.getTextboxLeft_() + 'px';
    var top = (this.getTextboxTop_() + this.textbox_.offsetHeight);
    this.dropdownLayer_.style.top = top + 'px';
    this.dropdownLayer_.style.visibility = 'visible';
  };

  /**
   * @private
   * @returns {boolean} whether suggestions were hidden in this call.
   */
  Suggest.prototype.hideSuggestions_ = function() {
    if (this.dropdownLayer_.style.visibility == 'hidden') {
      return false;
    }
    this.dropdownLayer_.style.visibility = 'hidden';
    return true;
  };

  /**
   * @private
   * @return {number} Left coordinate of the textbox.
   */
  Suggest.prototype.getTextboxLeft_ = function() {
    var node = this.textbox_;
    var left = 0;
    while (node.tagName != 'BODY') {
      left += node.offsetLeft;
      node = node.offsetParent;
    }
    return left;
  };

  /**
   * @private
   * @return {number} Top coordinate of the textbox.
   */
  Suggest.prototype.getTextboxTop_ = function() {
    var node = this.textbox_;
    var top = 0;
    while (node.tagName != 'BODY') {
      top += node.offsetTop;
      node = node.offsetParent;
    }
    return top;
  };

  /**
   * @private
   * @param {Event} event
   */
  Suggest.prototype.handleKeyUp_ = function(event) {
    var thisRef = this;
    if (this.isModifyingKey_(event.keyCode)) {
      this.provider_.requestSuggestions(this.textbox_.value,
                                        function(suggestions) {
        thisRef.setSuggestions_(suggestions);
      });
    }
  };

  /**
   * @private
   * @param {Event} event
   */
  Suggest.prototype.handleKeyDown_ = function(event) {
    var KEY_RETURN = 13;
    var KEY_UP = 38;
    var KEY_DOWN = 40;
    switch (event.keyCode) {
      case KEY_UP:
        this.previousSuggestion_();
        break;
      case KEY_DOWN:
        this.nextSuggestion_();
        break;
      case KEY_RETURN:
        if (this.hideSuggestions_()) {
          event.preventDefault();  // Not to send the whole form.
        }
        break;
    }
  };

  /**
   * @private
   * @param {number} keyCode
   * @returns {boolean} whether keyCode stands for modifying key.
   */
  Suggest.prototype.isModifyingKey_ = function(keyCode) {
    var KEY_DELETE = 46;
    var KEY_BACKSPACE = 8;
    var KEY_SPACE = 32;
    var KEY_F1 = 112;
    var KEY_F12 = 123;
    var KEY_LEFT_COMMAND = 91;
    var KEY_RIGHT_COMMAND = 93;
    if (keyCode == KEY_DELETE || keyCode == KEY_BACKSPACE) {
      return true;
    }
    if (keyCode < KEY_SPACE) {
      // Control keys.
      return false;
    }
    if (keyCode > KEY_SPACE && keyCode < KEY_DELETE) {
      // Navigation keys.
      return false;
    }
    if (keyCode >= KEY_F1 && keyCode <= KEY_F12) {
      return false;
    }
    if (keyCode == KEY_LEFT_COMMAND || keyCode == KEY_RIGHT_COMMAND) {
      return false;
    }
    return true;
  };

  /**
   * @private
   * @param {Node} suggestionNode
   */
  Suggest.prototype.highlightSuggestion_ = function(suggestionNode) {
    for (var i = 0; i < this.dropdownLayer_.childNodes.length; i++) {
      var node = this.dropdownLayer_.childNodes[i];
      if (node == suggestionNode) {
        node.className = 'current';
      } else if (node.className == 'current') {
        node.className = '';
      }
    }
  };

  /** @private */
  Suggest.prototype.nextSuggestion_ = function() {
    var suggestionNodes = this.dropdownLayer_.childNodes;
    if (suggestionNodes.length > 0 &&
        this.selectedIndex_ < suggestionNodes.length - 1) {
      var node = suggestionNodes[++this.selectedIndex_];
      this.highlightSuggestion_(node);
      this.textbox_.value = node.firstChild.nodeValue;
    }
  };

  /** @private */
  Suggest.prototype.previousSuggestion_ = function() {
    var suggestionNodes = this.dropdownLayer_.childNodes;
    if (suggestionNodes.length > 0 && this.selectedIndex_ > 0) {
      var node = suggestionNodes[--this.selectedIndex_];
      this.highlightSuggestion_(node);
      this.textbox_.value = node.firstChild.nodeValue;
    }
  };

  return Suggest;
});
