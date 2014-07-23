
Template.audio.sounds = function() {
    if(Meteor.userId()) {
        return audio.list();
    }
    else {
        return audio.cache.get();
    }
}

Template.audio.soundLoading = function() {
    //return (Session.get('sound_loading') ? true : false);
}

Template.audio.recordButtonText = function() {
    return (Session.get('recording') ? 'Stop' : 'Record');
}

Template.audio.recordingClass = function() {
    return (Session.get('recording') ? 'recording' : '');
}

Template.audio.events({

    'click .record-stop' : function(e) {
        if(recordingAllowed) {
            if(Session.get('recording')) {
                audio.stop();
            }
            else {
                audio.record();
            }
        }
        else {
            alert("You've reach the maximum of "
                + MAX_SOUNDS_PER_SONG + " recordings per song.");
        }
    }
});


Template.sound.srcURL = function() {
    return this.url();
}

Template.sound.rendered = function() {
    if(audio.createdTime == this.data.created) {
        Session.set('sound_loading', false);
        recordingAllowed = userCanAddSounds();
    }
}

Template.sound.events({

    'click .play-pause': function(e) {
        var el = e.currentTarget,
            sound = el.parentNode.getElementsByTagName('audio')[0],
            icon = el.querySelector('.glyphicon');
        if(icon.classList.contains('glyphicon-pause')) {
            sound.pause();
        }
        else {
            sound.load();
            sound.play();
        }
        icon.classList.toggle('glyphicon-play');
        icon.classList.toggle('glyphicon-pause');
    },
    
    'ended audio': function(e) {
        var icon = e.target.parentNode.querySelector('.glyphicon');
        icon.classList.remove('glyphicon-pause');
        icon.classList.add('glyphicon-play');
    },
    
    'click .close' : function(e) {
        if(Meteor.userId()) {
            Sounds.remove(this._id);
        }
        else {
            var sounds = audio.cache.get();
            for(var i = 0; i < sounds.length; i++) {
                if(sounds[i].created == this.created) {
                    sounds.splice(i, 1);
                    continue;
                }
            }
            audio.cache.set(sounds);
        }
    },
    
    'change input' : function(e) {
    
        if(Meteor.userId()) {
            Sounds.update({_id: this._id}, {$set: {title: e.target.value}});
        }
        else if(! this.title) {
            var sounds = audio.cache.get();
            for(var i = 0; i < sounds.length; i++) {
                if(sounds[i].created == this.created) {
                    sounds[i].title = e.target.value;
                    continue;
                }
            }
            audio.cache.set(sounds);
        }
    }
    
});
