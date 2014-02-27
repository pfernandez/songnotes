
Template.titleBar.songTitle = function() {
    return song.title();
}

Template.titleBar.saveIndicator = function() {
    if(Session.get('saving')) {
        return 'Saving...';
    }
    else {
        return 'Saved.';
    }
}

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
    },
    
    'click .record-stop' : function(e) {
        var target = e.target;
        if(target.classList.contains('recording')) {
            audio.stop();
            target.textContent = 'Record';
        }
        else {
            audio.record();
            target.textContent = 'Stop';
        }
        target.classList.toggle('recording');
    }
});
