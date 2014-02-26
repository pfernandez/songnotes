
Template.deleteDialogBody.title = function() {
    return Session.get('delete_dialogue').title;
}

Template.deleteDialog.events({
    // Remove song when the button is clicked.
    'click .remove' : function(e) {
        var songId = Session.get('delete_dialogue')._id;
        if(songId === song.id()) {
            song.id(null);
        }
        Songs.remove(songId);
        Session.set('delete_dialogue', {_id: null, title: 'this song'});
    }
});
