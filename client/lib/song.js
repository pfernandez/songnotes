song = {
	
	// If no argument is provided, returns the id of the current song.
	// Otherwise sets the current song to the specified id. Pass in NULL
	// to clear all song data.
	id: function(songId) {
		
		if(songId) {
		
			// Load the song if it isn't already loaded.
			if(songId != this.id()) {
			
				Session.set('sound_loading', null);
		
				// If it doesn't exist, replace the url and return.
				if(Songs.find({_id: songId}, {_id: 1}).count() < 1) {
					window.history.replaceState({_id: song.id()}, '', song.id());
					return;
				}
				
				Session.set('song_id', songId);
				
				if(songId) {
					Meteor.users.update({_id: Meteor.userId()},
						{$set: {currentSongId: this.id()}}
					);
					
					if(! window.event || ! window.event.state) {
						window.history.pushState({_id: songId}, '', songId);
					}
				}
			}
		}
		else if(songId === null) {
			Session.set('song_id', '');
			Session.set('sound_loading', null);
			window.history.replaceState({}, '', '.');
		}
		else {
			return Session.get('song_id');
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
				audio.cache.save(); // Saves audio to new song on login
			}
		});
	},
	
	// Returns a song title, or updates the title if provided.
	title: function(newTitle) {
		if(newTitle || newTitle === '') {
			Songs.update({_id: this.id()}, {$set: {title: newTitle}});
		}
		else {
			var songObj = Songs.findOne({_id: this.id()}, {fields: {title: 1}});
			if(songObj) {
				return songObj.title;
			}
		}
	},
	
	contentIsReactive: true,
	
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
				reactive: this.contentIsReactive
			});
			if(songObj) {
				this.contentIsReactive = false;
				return _.unescape(songObj.content);
			}
		}
	}
}
