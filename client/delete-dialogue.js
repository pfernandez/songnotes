
Template.deleteDialogBody.title = function() {
    return Session.get('delete_dialog').title;
}

Template.deleteDialog.events({
    // Remove song when the button is clicked.
    'click .remove' : function(e) {
        var songId = Session.get('delete_dialog')._id;
        Songs.remove(songId);
        Session.set('delete_dialog', {_id: null, title: 'this song'});
        if(songId === song.id()) {
            // Set the current song to something else if it's being removed.
            var result = Songs.findOne({ownerId: Meteor.userId()},
                {sort: {created: -1}}, {fields: {title: 1}});
            song.id(result._id);
        }
    }
});
