
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
    // Return a blob URL.
    var blob = new Blob([this.file],{type: this.type});
    return (window.URL || window.webkitURL).createObjectURL(blob);
    
    
    
    // Return a base64 URL.
    //console.log(this);
    //var base64Data = btoa(this.data);//String.fromCharCode.apply(null, this.file));
    //return 'data:' + this.type + ';base64,' + base64Data;
}

Template.sound.events({

    'click .play-pause': function(e) {
        var el = e.currentTarget;
        var sound = el.parentNode.getElementsByTagName('audio')[0];
        //console.log(sound);
        togglePlay(el.querySelector('.glyphicon'), sound);
    },
    
    'ended audio': function(e) {
        var icon = e.target.parentNode.querySelector('.glyphicon');
        icon.classList.remove('glyphicon-stop');
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
