
var savedSelection = null, // temp storage for the Rangy library
    interval = null;       // for the "saving..." message

Template.editor.songContent = function() {
    return song.content();
}

Template.editor.events({

    // Store the content in the editor.
    'input #content' : function(e) {
        savedSelection = rangy.saveSelection();
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

Template.editor.rendered = function() {
    // Restore selection and/or cursor position when the content is redrawn.
    if(savedSelection) {
        rangy.restoreSelection(savedSelection);
    }
}

