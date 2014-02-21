/*
This file will be executed only on the client.
*/



////////////////////////////////////////////////////////////////////////////////
// Helper Variables and Functions


var justLoggedIn = false,   // so we can store an entered song on login
    savedSelection = null,  // temp storage for the Rangy library
    editorHasFocus = false, // used to return focus to editor on hot reload
    timeOut = null,
    interval = null;

Session.setDefault('saving', false);

// Reactive data storage for the delete dialog.
Session.setDefault('songToDelete', {_id: null, title: null});

var song = {
    
    // If no argument is provided, returns the id of the current song.
    // Otherwise sets the current song to the specified id. Pass in NULL
    // to clear all song data.
    id: function(songId) {
        if(songId || songId === null) {
            Session.set('song_id', songId);
        }
        else {
            return Session.get('song_id');
        }
        if(songId) {
            Meteor.users.update({_id: Meteor.userId()},
                {$set: {currentSongId: this.id()}}
            );
        }
    },

    // Set the id to the user's most recently visited song.
    loadMostRecent: function() {
        var user = Meteor.users.findOne({_id: Meteor.userId()},
            {fields: {currentSongId: 1}});
        if(user) {
            this.id(user.currentSongId);
        }
    },

    // Attempt to add a new song on the server, and store it's ID as
    // the user's current song if successful.
    add: function(properties) {        
        var that = this;
        Meteor.call('newSong', properties, function(error, newSong) {
            if(error) {
                console.log(error.reason);
            }
            else if(newSong) {
                that.id(newSong._id);
            }
        });
    },
    
    // Returns a song title, or updates the title if provided.
    title: function(newTitle) {
        if(newTitle) {
            Songs.update({_id: this.id()}, {$set: {title: newTitle}});
        }
        else {
            var songObj = Songs.findOne({_id: this.id()}, {fields: {title: 1}});
            if(songObj) {
                return songObj.title;
            }
        }
    },
    
    // Returns a song's content, or updates the content if provided.
    content: function(newContent, callback) {
        if(newContent) {
    	   Songs.update({_id: song.id()},
	            {$set: {content: _.escape(newContent)}},
	            function() { callback(); }
	        );
	    }
        else {
            songObj = Songs.findOne({_id: this.id()},{fields: {content: 1}});
            if(songObj) {
                return _.unescape(songObj.content);
            }
        }
    },

}


// Retrieve the current song ID and title on login or refresh.
Deps.autorun(function() {

    if(Meteor.loggingIn()) {
        justLoggedIn = true;
    }

    var userId = Meteor.userId();
    
    if(userId && ! song.id()) {
        // If there was a song begun before login, add it to the database.
        // Otherwise load the most recent song.
        if(justLoggedIn) {
        
            var titleElement = document.getElementById('song-title'),
                contentElement = document.getElementById('editor'),
                newTitle = null,
                newContent = null;
                
            if(titleElement) {
                var newTitle = titleElement.value;
            }
            
            if(contentElement) {
                var newContent = contentElement.innerHTML;
            }
            
            if(newTitle || newContent) {
                song.add({title: newTitle, content: newContent});
            }
            
            justLoggedIn = false;
        }
        
        song.loadMostRecent();
    }
    else if(! userId && song.id()) {
        // The user just logged out, so remove the current song.
        song.id(null);
        
        // This is a hack, because the title wasn't re-rendering on logout.
        //document.getElementById('song-title').value = '';
    }
});



////////////////////////////////////////////////////////////////////////////////
// song.html


Template.song.songTitle = function() {
    return song.title();
}

Template.song.songContent = function() {
    return song.content();
}

Template.song.saveIndicator = function() {
    if(Session.get('saving')) {
        return 'Saving...';
    }
    else {
        return 'Saved.';
    }
}

Template.song.events({

    // Store the title on keyup in the input field.
    'change input' : function(e) {
        var newTitle = getUniqueTitle(e.target.value);
        if(song.id()) {
		    song.title(newTitle);
		}
		else {
		    song.add({title: newTitle});
		}
    },

    // Store the content in the editor.
    'input #editor' : function(e) {
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
    
    'focus #editor': function() {
        editorHasFocus = true;
    },
    
    'blur #editor': function() {
        editorHasFocus = false;
    },
    
    'click .logInToSave': function() {
        $('.dropdown-toggle').click();
        return false;
    }
});

Template.song.rendered = function() {
    // Restore selection and/or cursor songion when the editor is redrawn.
    if(savedSelection) {
        rangy.restoreSelection(savedSelection);
    }
}



////////////////////////////////////////////////////////////////////////////////
// songlist.html

Template.songList.userSongs = function() {
    return getSongList(Meteor.userId());
}

Template.songList.events({
    // add an empty song when the button is clicked.
    'click .addSong' : function(e) {
        song.add();
    },
});

Template.songList.rendered = function() {

    // If the user has any songs, make sure one is always current.
    var list = this.findAll('.list-group-item');
    if(list.length > 0 && ! this.find('.active')) {
        list[list.length-1].click();
    }
    
    // Updating the song list causes the editor to lose focus. Refocus it.
    if(editorHasFocus) {
       document.getElementById('editor').focus();
    }
}

Template.songItem.songClass = function() {
    return (song.id() === this._id) ? 'active' : '';
}

Template.songItem.events({
    'click .list-group-item': function(e) {
        e.preventDefault();
        if(! Session.get('songToDelete')._id) {
            song.id(this._id);
        }
    }
});

Template.songItem.events({
    // Remove song when the button is clicked.
    'click .close' : function(e) {
        Session.set('songToDelete', this);
    }
});



////////////////////////////////////////////////////////////////////////////////
// delete.html


Template.deleteSongDialogBody.deleteSongTitle = function() {
    return Session.get('songToDelete').title;
}

Template.deleteSongDialog.events({
    // Remove song when the button is clicked.
    'click .removeSong' : function(e) {
        var songId = Session.get('songToDelete')._id;
        if(songId === song.id()) {
            song.id(null);
        }
        Songs.remove(songId);
        Session.set('songToDelete', {_id: null, title: 'this song'});
    }
});

