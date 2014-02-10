/*
This file will be executed only on the client.
*/


// Variables to be used for local temp storage.
var id,
    savedSelection,
    editorHasFocus,
    songToDelete;
    

// Retrieve the current song ID on login or refresh.
Meteor.autorun(function() {
    if(Meteor.userId()) {
        id = Meteor.users.findOne(
            {_id: Meteor.userId()},
            {fields: {'currentSong': 1}}
        ).currentSong;
        Session.set('song_id', id);
    }
    else {
        Session.set('song_id', null);
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
                Session.set('title', newSong.title);
            }
            else {
                Session.set('title', '');
            }
        }
    });
}

var removeSong = function(songId) {
    Songs.remove(songId);
    setCurrentSong(null);
}

// Set the a session variable and update the user document to the 
// ID of the current song.
var setCurrentSong = function(songId) {
    id = songId;
    Session.set('song_id', songId);
    var title = '';
    if(songId) {
        title = getTitle(id);
    }
    Session.set('title', title);
    Meteor.users.update({_id: Meteor.userId()}, {$set: {currentSong: songId}});
}

var getTitle = function(songId) {
    Songs.findOne({_id: songId}, {fields: {title: 1}}).title;
}


////////////////////////////////////////////////////////////////////////////////
// song.html


Template.song.songTitle = function() {
    return Session.get('title');
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
            Session.set('title', newTitle);
		    Songs.update({_id: id}, {$set: {title: newTitle}});
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

Template.songList.currentSong = function() {
    return Session.get('song_id');
}

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
    return Session.equals('song_id', this._id) ? 'active' : '';
}

Template.songItem.events({
    'click': function(e) {
        e.preventDefault();
        setCurrentSong(this._id);
    }
});

Template.songItem.events({
    // Remove song when the button is clicked.
    'click .close' : function(e) {
        songToDelete = this._id;
    }
});



////////////////////////////////////////////////////////////////////////////////
// delete.html

Template.deleteSongDialog.events({
    // Remove song when the button is clicked.
    'click .removeSong' : function(e) {
        removeSong(songToDelete);
    }
});

