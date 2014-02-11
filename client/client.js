/*
This file will be executed only on the client.
*/


////////////////////////////////////////////////////////////////////////////////
// Helper Variables and Functions

var id = null,              // the _id of the current song
    savedSelection = null,  // temp storage for the Rangy library
    editorHasFocus = false, // used to return focus to editor on hot reload
    untitled = false;       // used to avoid undesired hot reload of title input

// Reactive data storage for the delete dialog.
Session.setDefault('songToDelete', {_id: null, title: null});

// Retrieve the current song ID and title on login or refresh.
Meteor.autorun(function() {
    var userId = Meteor.userId();
    if(userId && ! id) {
        var user = Meteor.users.findOne({_id: userId},
            {fields: {currentSongId: 1}});
        id = user.currentSongId;
    }
});

// Attempt to add a new song on the server, and store it's ID as
// the user's current song if successful.
var addSong = function(properties) {
    Meteor.call('newSong', properties, function(error, newSong) {
        if(error) {
            console.log(error.reason);
        }
        else if(newSong) {
        
            setCurrentSong(newSong._id);
            
            // If a title was passed in...
            if(properties && properties.hasOwnProperty('title')) {
                untitled = false;
            }
            else {
                untitled = true;
            }
        }
    });
}

var setCurrentSong = function(songId) {
    id = songId;
    Meteor.users.update({_id: Meteor.userId()}, {$set: {currentSongId: id}});
}

var getTitle = function(songId) {
    var songObj = Songs.findOne({_id: songId}, {fields: {title: 1}});
    if(songObj && ! untitled) {
        return songObj.title;
    }
    else {
        return '';
    }
}



////////////////////////////////////////////////////////////////////////////////
// song.html


Template.song.songTitle = function() {
    return getTitle(id);
}

Template.song.songLyrics = function() {
    if(id) {
        return _.unescape(
            Songs.findOne({_id: id},{fields: {lyrics: 1}}).lyrics
        );
    }
}

Template.song.events({

    // Store the title on keyup in the input field.
    'change input' : function(e) {
        var newTitle = getUniqueTitle(e.target.value);
        if(id) {
		    Songs.update({_id: id}, {$set: {title: newTitle}});
		    untitled = false;
		}
		else {
		    addSong({title: newTitle});
		}
    },

    // Store the lyrics on keyup in the editor.
    'keyup #editor' : function(e) {
        savedSelection = rangy.saveSelection();
        if(id) {
	        Songs.update({_id: id},
	            {$set: {lyrics: _.escape(e.target.innerHTML)}}
	        );
	    }
	    else {
	        addSong({lyrics: _.escape(e.target.innerHTML)});
	    }
    },
    
    'focus #editor': function() {
        editorHasFocus = true;
    },
    
    'blur #editor': function() {
        editorHasFocus = false;
    }
});

Template.song.rendered = function() {

    // Restore selection and/or cursor postion when the editor is redrawn.
    if(savedSelection) {
        rangy.restoreSelection(savedSelection);
    }
    
    // Updating the song list causes the editor to lose focus. Refocus it.
    if(editorHasFocus) {
        this.find('#editor').focus();
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
        addSong();
    },
});

Template.songList.rendered = function() {

    // If the user has any songs, make sure one is always current.
    var list = this.findAll('.list-group-item');
    if(list.length > 0 && ! this.find('.active')) {
        list[list.length-1].click();
    }
}

Template.songItem.href = function() {
    return '/' + this._id;
}

Template.songItem.songClass = function() {
    return (id === this._id) ? 'active' : '';
}

Template.songItem.events({
    'click .list-group-item': function(e) {
        e.preventDefault();
        if(! Session.get('songToDelete')._id) {
            untitled = false;
            setCurrentSong(this._id);
        }
    }
});

Template.songItem.events({
    // Remove song when the button is clicked.
    'click .close' : function(e) {
        Session.set('songToDelete', {
            _id: this._id,
            title: getTitle(this._id)
        });
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
        if(songId === id) {
            setCurrentSong(null);
        }
        Songs.remove(songId);
        Session.set('songToDelete', {_id: null, title: 'this song'});
    }
});

