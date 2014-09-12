
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

Template.editor.events({

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
