song = {
    
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
            songObj = Songs.findOne({_id: this.id()}, {
                fields: {content: 1},
                reactive: false
            });
            if(songObj) {
                return _.unescape(songObj.content);
            }
        }
    }
}
