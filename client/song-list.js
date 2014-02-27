
Template.songList.userSongs = function() {
    return getSongList(Meteor.userId());
}

Template.songList.events({
    // add an empty song when the button is clicked.
    'click .addSong' : function(e) {
        song.add();
    },
});

Template.songList.rendered = function() {

    // If the user has any songs, make sure one is always current.
    var list = this.findAll('.list-group-item');
    if(list.length > 0 && ! this.find('.active')) {
        list[list.length-1].click();
    }
    
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
