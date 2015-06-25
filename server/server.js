/*
This file will only be executed on the server.
*/

Meteor.publish('songs', function() {
	// Users may only view their own songs.
	return Songs.find({ownerId: this.userId});
});

Meteor.publish('sounds', function() {
	// Users may only view their own songs.
	return Sounds.find({ownerId: this.userId});
});

Meteor.publish('userData', function () {
  return Meteor.users.find({_id: this.userId},
	{fields: {'currentSongId': 1}});
});

// Add fields to the user document upon creation.
Accounts.onCreateUser(function(options, user) {
	user.currentSongId = null;
	return user;
});
