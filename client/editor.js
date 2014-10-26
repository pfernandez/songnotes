
var interval = null;       // for the "saving..." message

Template.editor.rendered = function () {
    // The Blaze templating engine doesn't handle contenteditable elements
    // well yet, so add the reactivity manually.
    var that = this;
    this.contentAutorun = Deps.autorun(function () {
        var content = song.content();
        if(Session.get('song_id')) {
            that.find("#content").innerHTML = content;
        }
        else {
            that.find("#content").innerHTML = '';
        }
    });
};

Template.editor.annotations = function() {
    console.log('adf');
    return Annotations.find().fetch().map(function(it){ return it.name; });
};

Template.editor.events({

    'click #insert' : function() {
        pasteHtmlAtCaret('<span class="annotation-wrapper" '
            + 'contenteditable="false"><input class="form-control typeahead" '
            + 'name="team" type="text" placeholder="A#..." autocomplete="off" '
            + 'spellcheck="off" data-source="annotations"/></span>');
        Meteor.typeahead('.typeahead', chordList);
        document.getElementsByClassName('typeahead')[0].focus();
    },
    
    // Replace the typeahead box with the chosen annotation.
    'keyup .typeahead' : function(e) {
        
        // Submit when Enter or Tab is pressed.
        var key = e.keyCode;
        if(9 == key || 13 == key) {
            e.preventDefault();
            var wrapper = findParentBySelector(e.target, '.annotation-wrapper');
            wrapper.innerHTML = '<span class="annotation">' + e.target.value + '</span>';
            
            // Insert the caret after the annotation.
            var editor = document.getElementById('content');
            insertCaretAfter(wrapper, editor); 
         }
    },
    
    // Store the content in the editor.
    'input #content' : function(e) {
        if(song.id()) {
        
            // If "saving..." is not visible, show it.
            if(! interval) {
                Session.set('saving', true);
            }

            // Store the content to database. If successful, check every 3
            // seconds to see if "saving..." is visible. If it is, turn it off.
            song.content(e.target.innerHTML, function() {
                if(! interval) {
                    interval = Meteor.setInterval(function() {
                        Session.set('saving', false);
                        Meteor.clearInterval(interval);
                        interval = null;
                    }, 3000);
                }
            });
        }
        else {
            song.add({content: _.escape(e.target.innerHTML)});
        }
    },
    
    'focus #content': function() {
        contentHasFocus = true;
    },
    
    'blur #content': function() {
        contentHasFocus = false;
    },
    
    'click .logInToSave': function() {
        document.documentElement.scrollTop = 0;
        document.querySelector('.dropdown-toggle').click();
        document.querySelector('#login-email').focus();
        return false;
    }
});


function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // non-standard and not supported in all browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ( (node = el.firstChild) ) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);
            
            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
}

// Insert caret after node within container element.
function insertCaretAfter(node, container) {
    var range = document.createRange(),
        sel = window.getSelection();
    range.setStart(container, 0);
    range.setEndAfter(node);
    range.collapse();
    sel.removeAllRanges();
    sel.addRange(range);
}

function collectionHas(a, b) { //helper function (see below)
    for(var i = 0, len = a.length; i < len; i ++) {
        if(a[i] == b) return true;
    }
    return false;
}
function findParentBySelector(elm, selector) {
    var all = document.querySelectorAll(selector);
    var cur = elm.parentNode;
    while(cur && !collectionHas(all, cur)) { //keep going up until you find a match
        cur = cur.parentNode; //go up
    }
    return cur; //will return null if not found
}
