
Template.audio.sounds = function() {
    return song.recordingsList();
}

Template.audio.sounds = function() {
    
    if(Meteor.userId()) {
        return audio.list();
    }
    else {
        return Session.get('audio');
    }
}

Template.audio.events({

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


Template.sound.srcURL = function() {
    // Return a blob URL. Does not work yet in Android Chrome 33 or FF.
    //var blob = new Blob([this.file],{type: this.type});
    //return (window.URL || window.webkitURL).createObjectURL(blob);
    
    // Return a base64 URL. Works in Android Chrome 33 Beta & FF 27.0.
    var s = '';
    for(var i = 0, l = this.file.length; i < l; i++) {
        s += String.fromCharCode(this.file[i]);
    }
    return 'data:' + this.type + ';base64,' + btoa(s);
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
