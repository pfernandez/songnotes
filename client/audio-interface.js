
Template.audio.sounds = function() {
    return song.recordingsList();
}

Template.audio.sounds = function() {
    return audio.list();
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

Template.sound.title = function() {
    var result = Sounds.findOne({_id: this._id}, {fields: {title: 1}});
    if(result) {
        return result.title;
    }
}

Template.sound.blobURL = function() {
    var blob = new Blob([this.file],{type: this.type});
    return (window.URL || window.webkitURL).createObjectURL(blob);
}

Template.sound.events({
    'click .play-pause': function(e) {
        //var sound = document.getElementById(this._id);
        var sound = document.body.querySelector('#' + this._id + ' audio');
        togglePlay(e.target, sound);
        sound.removeAttribute('loop');
    },
    
    'ended audio': function(e, template) {
       // var sound = document.getElementById(this._id);
        var icon = document.body.querySelector('#' + this._id + ' span');
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

var togglePlay = function(target, sound) {
    if(target.classList.contains('glyphicon-pause')) {
        sound.pause();
    }
    else {
        sound.play();
    }
    target.classList.toggle('glyphicon-play');
    target.classList.toggle('glyphicon-pause');
}
