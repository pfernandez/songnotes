
Template.deleteSongDialogBody.deleteSongTitle = function() {
    return Session.get('songToDelete').title;
}

Template.deleteSongDialog.events({
    // Remove song when the button is clicked.
    'click .removeSong' : function(e) {
        var songId = Session.get('songToDelete')._id;
        if(songId === song.id()) {
            song.id(null);
        }
        Songs.remove(songId);
        Session.set('songToDelete', {_id: null, title: 'this song'});
    }
});
