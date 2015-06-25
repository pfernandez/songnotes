
Template.deleteDialogBody.helpers({
	
	title: function() {
		return Session.get('delete_dialog').title;
	}
});


Template.deleteDialog.events({
	
	// Remove song when the button is clicked.
	'click .remove' : function(e) {

		// Remove the song and clear the session variable.
		var songId = Session.get('delete_dialog')._id;
		Songs.remove({_id: songId});
		Session.set('delete_dialog', {_id: null, title: 'this song'});
		
		// Set the current song to something else if it's being removed.
		if(songId === song.id()) {
			var result = Songs.findOne({ownerId: Meteor.userId()},
				{sort: {created: -1}}, {fields: {title: 1}});
			result ? song.id(result._id) : song.id(null);
		}
		
		// Remove any associated recordings by _id.
		var sounds = Sounds.find({'songId': songId}, {fields: {_id: 1}});
		sounds.forEach(function(sound) {
			Sounds.remove({_id: sound._id});
		});
	}
});
