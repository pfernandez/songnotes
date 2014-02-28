
Template.audio.sounds = function() {
    return song.recordingsList();
}

Template.audio.sounds = function() {
    
    if(Meteor.userId()) {
        return audio.list();
    }
    else {
        console.log(Session.get('audio'));
        return Session.get('audio');
    }
}

Template.audio.events({

    'click .record-stop, tap .record-stop' : function(e) {
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


Template.sound.blobURL = function() {
    var blob = new Blob([this.file],{type: this.type});
    return (window.URL || window.webkitURL).createObjectURL(blob);
}

Template.sound.events({

    'click .play-pause': function(e) {
        var el = e.currentTarget;
        var sound = el.parentNode.getElementsByTagName('audio')[0];
        togglePlay(el.querySelector('.glyphicon'), sound);
    },
    
    'ended audio': function(e) {
        var icon = e.target.parentNode.querySelector('.glyphicon');
        icon.classList.remove('glyphicon-pause');
        icon.classList.add('glyphicon-play');
    },
    
    'click .close' : function(e) {
        Session.set('delete_dialogue', this);
        Sounds.remove(this._id);
    },
    
    'change input' : function(e) {
        Sounds.update({_id: this._id}, {$set: {title: e.target.value}});
    }
    
});

var togglePlay = function(icon, sound) {
    if(icon.classList.contains('glyphicon-pause')) {
        sound.pause();
    }
    else {
        sound.play();
    }
    icon.classList.toggle('glyphicon-play');
    icon.classList.toggle('glyphicon-pause');
}
