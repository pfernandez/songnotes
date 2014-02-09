/*
This file will be executed only on the client.
*/


var id = null,
    untitled = false;

// Retrieve the current song ID on login or refresh.
Meteor.autorun(function() {
    if(Meteor.userId()) {
        id = Meteor.users.findOne(
            {_id: Meteor.userId()},
            {fields: {'currentSong': 1}}
        ).currentSong
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
                Session.set('song_title', newSong.title);
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
    Meteor.users.update({_id: Meteor.userId()}, {$set: {currentSong: songId}});
}



////////////////////////////////////////////////////////////////////////////////
// song.html

var savedSelection = null;

Template.song.songTitle = function() {
    if(id) {
        return Songs.findOne({_id: id}, {fields: {title: 1}}).title;
    }
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
    
    }
});

Template.song.rendered = function() {
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
        e.preventDefault();
        addSong();
    },
});

Template.songList.currentSong = function() {
    return Session.get('song_id');
}

Template.songItem.songClass = function() {
    return Session.equals('song_id', this._id) ? 'active' : '';
}

Template.songItem.events({
    'click': function() {
        setCurrentSong(this._id);
    }
});

Template.songItem.events({
    // Remove song when the button is clicked.
    'click .removeSong' : function() {
        removeSong(this._id);
    }
});



