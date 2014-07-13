
Template.audio.sounds = function() {
    
    if(Meteor.userId()) {
        return audio.list();
    }
    else {
        return cachedAudio.get();
    }
}

Template.audio.soundLoading = function() {
    return (Session.get('sound_loading') ? true : false);
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

    return this.blobURL ||
        window.location.protocol + "//" + window.location.host + this.url();
    
    // Return a blob URL. Does not work yet in Android Chrome 33 or FF.
    //var blob = new Blob([this.file],{type: this.type});
    //return (window.URL || window.webkitURL).createObjectURL(blob);
    
    /* Return a base64 URL. Slow, but works in Android Chrome 33 Beta 
       & FF 27.0.
    var s = '';
    for(var i = 0, l = this.file.length; i < l; i++) {
        s += String.fromCharCode(this.file[i]);
    }
    return 'data:' + this.type + ';base64,' + btoa(s);*/
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
            var sounds = cachedAudio.get();
            for(var i = 0; i < sounds.length; i++) {
                if(sounds[i].created == this.created) {
                    sounds.splice(i, 1);
                    continue;
                }
            }
            cachedAudio.set(sounds);
        }
    },
    
    'change input' : function(e) {
        if(Meteor.userId()) {
            Sounds.update({_id: this._id}, {$set: {title: e.target.value}});
        }
        else if(! this.title) {
            var sounds = cachedAudio.get();
            for(var i = 0; i < sounds.length; i++) {
                if(sounds[i].created == this.created) {
                    sounds[i].title = e.target.value;
                    continue;
                }
            }
            cachedAudio.set(sounds);
        }
    }
    
});
