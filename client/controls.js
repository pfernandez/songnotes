
Template.controls.songTitle = function() {
    return song.title();
}

Template.controls.saveIndicator = function() {
    if(Session.get('saving')) {
        return 'Saving...';
    }
    else {
        return 'Saved.';
    }
}

Template.controls.events({

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
    
    'click .record' : function() {
        audio.record();
    },
    
    'click .stop' : function() {
        audio.stop();
    },
    
    'click .play' : function() {
        audio.play();
    },
    
    'click .loop' : function() {
        audio.loop();
    }
});
