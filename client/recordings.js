

Template.recordings.songRecordings = function() {
    return song.recordingsList();
}

Template.recordings.events({

});

Template.recordings.rendered = function() {

    // If the user has any songs, make sure one is always current.
    //var list = this.findAll('.list-group-item');
    //if(list.length > 0 && ! this.find('.active')) {
    //    list[list.length-1].click();
    //}
    
    // Updating the song list causes the content to lose focus. Refocus it.
    //if(contentHasFocus) {
    //   document.getElementById('content').focus();
    //}
}

Template.recordingItem.songClass = function() {
    //return (song.id() === this._id) ? 'active' : '';
}

Template.recordingItem.events({
    'click .list-group-item': function(e) {
        e.preventDefault();
        //if(! Session.get('songToDelete')._id) {
        //    song.id(this._id);
        //}
    }
});

Template.recordingItem.events({
    // Remove song when the button is clicked.
    'click .close' : function(e) {
        //Session.set('songToDelete', this);
    }
});
