
Template.titleBar.helpers({
	
	songTitle: function() {
		if(Meteor.userId) {
			return song.title();
		}
	},
	
	saveIndicator: function() {
		if(Meteor.userId) {
			if(Session.get('saving')) {
				return 'Saving...';
			}
			else {
				return 'Saved.';
			}
		}
	}
});

Template.titleBar.events({

	// Store the title in the input field.
	'change input' : function(e) {
		var newTitle = getUniqueTitle(e.target.value);
		if(song.id()) {
			song.title(newTitle);
		}
		else {
			song.add({title: newTitle});
		}
	}
});
