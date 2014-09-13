
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
        var el = '<input class="form-control typeahead" name="team" '
            + 'type="text" placeholder="A#..." autocomplete="off" '
            + 'spellcheck="off" data-source="annotations"/>';
        pasteHtmlAtCaret(el);
        Meteor.typeahead('.typeahead', ['A', 'A7', 'Am', 'Am7', 'A#', 'A#7']);
    },
    
    // TODO: replace the typeahead box with the chosen annotation.
    'change .typeahead' : function(e) {
        console.log(e.target);
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
