
Template.songList.userSongs = function() {
    return getSongList(Meteor.userId());
}

Template.songList.userCanAddSongs = function() {
    return userCanAddSongs();
}

Template.songList.events({
    // add an empty song when the button is clicked.
    'click .addSong' : function(e) {
        song.add();
    },
});

Template.songList.rendered = function() {
    toggleLists();
    // Updating the song list causes the content to lose focus. Refocus it.
    if(contentHasFocus) {
       document.getElementById('content').focus();
    }
}

Template.songItem.songClass = function() {
    return (song.id() === this._id) ? 'active' : '';
}

Template.songItem.events({
    'click .list-group-item': function(e) {
        e.preventDefault();
        console.log(this._id);
        if(! Session.get('delete_dialog')._id) {
            song.id(this._id);
        }
    }
});

Template.songItem.events({
    // Remove song when the button is clicked.
    'click .close' : function(e) {
        Session.set('delete_dialog', this);
    }
});
