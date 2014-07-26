audio = function() {

    var audioContext,
        audioInput,
        audioRecorder,
        source,
        playing,
        initialized = false,
        recTimer = null;

    var init = function() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        return methods;
    };
    
    var initGetUserMedia = function(callback) {

        navigator.getMedia = (navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);
                           
        if (! navigator.getMedia) {
            alert('Sorry, audio recording is not natively supported in '
                + 'your web browser. Try Chrome, Firefox, or Opera.');
            return;
        }
        
        navigator.getMedia(
        
            { audio: true },
            
            function(stream) {
            
                audioInput = audioContext.createMediaStreamSource(stream);
                
                // Hopefully prevents clipping on init.
                var inputPoint = audioContext.createGain();
                inputPoint.gain.value = 0.0;
                audioInput.connect(inputPoint);
                inputPoint.connect(audioContext.destination);
                
                audioRecorder = new Recorder(audioInput);
                callback && callback();
            },
            
            function(err) {
                console.log('Error getting audio: ' + err);
                Session.set('recording', false);
            }
        );
    };
    
    var startRecording = function() {
        audioRecorder.clear();
        Session.set('recording', true);
        // Stop recording automatically after 1 minute.
        recTimer = setTimeout(function() {
            if(Session.get('recording')) {
                methods.stop();
                alert("You've reach the max time of "
                    + MAX_SECONDS_PER_SOUND
                    + " seconds for a recording.");
            }
        }, MAX_SECONDS_PER_SOUND * 1000);
        audioRecorder.record();
    };
    
    var stopRecording = function() {
        audioRecorder.stop();
        Session.set('recording', false);
        if(recTimer) {
            clearTimeout(recTimer);
            recTimer = null;
        }
    };
    
    var saveToFile = function(newFile) {
        Sounds.insert(newFile, function (err, fileObj) {
            Session.set('sound_loading', false);
            if(err) {
                alert('Unable to save sound: ' + err.reason);
                console.log(err);
            }
        });
    };

    var methods = {
    
        createdTime: null,
    
        record: function() {
            
            // Initialize getUserMedia on first usage.
            if(! initialized) {
                initGetUserMedia(function() {
                    initialized = true;
                    startRecording();
                });
            }
            else if(! Session.get('recording') && ! playing) {
                startRecording();
            }
        },
        
        stop: function() {
            if(Session.get('recording')) {
                stopRecording();
                this.save();
            }
            else if(playing) {
                source.stop();
                playing = false;
            }
        },
    
        play: function(loop) {
            if(Session.get('recording')) {
                stopRecording();
            }
            if(! playing) {
                playing = true;
                audioRecorder.getBuffer(function(buffers) {
                    source = audioContext.createBufferSource();
                    var buffer = audioContext.createBuffer(
                        2, buffers[0].length, audioContext.sampleRate);
                    buffer.getChannelData(0).set(buffers[0]);
                    buffer.getChannelData(1).set(buffers[1]);
                    source.buffer = buffer;
                    source.connect(audioContext.destination);
                    source.start(0);
                    source.loop = loop || false;
                    source.onended = function() {
                        playing = false;
                    }
                });
            }
        },
        
        loop: function() {
            this.play(true);
        },

        download: function() {
            audioRecorder.getBuffer(function(buffers) {
                audioRecorder.exportWAV(function(blob) {
                    Recorder.forceDownload(blob);
                });
            });
        },
        
        list: function() {
            var result = Sounds.find({'songId': song.id()});
            if(result.count() > 0) {
                return result;
            }
            else {
                return null;
            }
        },
        
        // Save a new sound to the server, or cache it locally if not logged in.
        save: function(audioFile) {
            
            if(audioFile) {
                // If a sound object was passed in, save it.
                saveToFile(audioFile);
            }
            else {
                var that = this;
                that.createdTime = Date.now();
                Session.set('sound_loading', true);
            
                // Store the sound currently loaded in the buffer.
                audioRecorder.exportWAV(function(blob) {
                
                    audioRecorder.clear();
                    
                    var newFile = new FS.File(blob);
                    newFile.ownerId = Meteor.userId();
                    newFile.name('untitled');
                    newFile.extension('wav');
                    newFile.songId = song.id();
                    newFile.created = that.createdTime;
                    
                    if(Meteor.userId()) {
                        // If logged in, save the file to disk.
                        saveToFile(newFile);
                    }
                    else {
                        // If not logged in, store it in a local array.
                        that.cache.append(newFile);
                    }
                });
            }
        },
                
        // Temporary reactive audio storage for non-logged in users.
        cache: {

            data: [],
            
            get: function() {
                if(! this.dependency) {
                    this.dependency = new Deps.Dependency();
                }
                this.dependency.depend();
                return this.data;
            },
            
            set: function(fileArray) {
                this.data = fileArray;
                this.dependency.changed();
            },
            
            append: function(audioFile) {
                // Temporarily replace Fs.File.url(), returning a blob URL 
                // until it is saved to the filesystem.
                audioFile.url_tmp = audioFile.url;
                audioFile.url = function() {
                    return (window.URL || window.webkitURL)
                        .createObjectURL(this.data.blob);
                }
                this.data.push(audioFile);
                this.dependency.changed();
            },
            
            save: function() {
                var sounds = this.data;
                if(! _.isEmpty(sounds)) {
                    for(i = 0; i < sounds.length; i++) {
                        sounds[i].url = sounds[i].url_tmp;
                        delete sounds[i].url_tmp;
                        sounds[i].ownerId = Meteor.userId();
                        sounds[i].songId = song.id();
                        audio.save(sounds[i]);
                    }
                    this.set([]);
                }
            }
        }
    };
    
    return init();
}();
