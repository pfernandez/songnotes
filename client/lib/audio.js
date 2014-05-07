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
            
                //var inputPoint = audioContext.createGain();
                //inputPoint.gain.value = 0.0;
                //audioInput.connect(inputPoint);
                //inputPoint.connect(audioContext.destination);
                
                audioRecorder = new Recorder(audioInput);
                callback && callback();
            },
            
            function(err) {
                console.log('Error getting audio: ' + err);
                Session.set('recording', false);
            }
        );
    };
    
    var BinaryFileReader = {
        read: function(file, callback) {
            var reader = new FileReader;

            var fileInfo = {
                type: file.type,
                size: file.size,
                file: null
            }

            reader.onload = function(){
                fileInfo.file = new Uint8Array(reader.result);
                callback(null, fileInfo);
            }
            reader.onerror = function(){
                callback(reader.error);
            }

            reader.readAsArrayBuffer(file);
        }
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
    
    var saveToDB = function(properties) {
        Meteor.call('newSound', properties,
            function(error, newSound) {
                if(error) {
                    alert('Unable to save sound: ' + error.reason);
                }
            }
        );
    };
    
    var saveToFile = function(properties) {
    
        var newFile = new FS.File(properties.file);
        newFile.songId = properties.songId;
        newFile.ownerId = Meteor.userId();
    
        Sounds.insert(newFile, function (err, fileObj) {
            if(err) {
                alert('Unable to save sound: ' + err.reason);
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
        
        // Add a new sound to the server, or to Session if not logged in.
        save: function(properties) {
            
            if(properties) {
                // If a sound object was passed in, store it to the database
                // along with the current song id.
                properties.songId = song.id();
                saveToFile(properties);
            }
            else {
            
                var createdTime = Date.now();
                this.createdTime = createdTime;
                Session.set('sound_loading', true);
            
                // Store the sound currently loaded in the buffer.
                audioRecorder.exportWAV(function(blob) {
                
                    audioRecorder.clear();
                    
                    var properties = [];
                    properties.file = blob;
                
                  //  BinaryFileReader.read(blob, function(err, properties) {
                    
                        properties.songId = song.id();
                        properties.created = createdTime;
                    
                        if(Meteor.userId()) {
                            // If logged in, put it in the database.
                            saveToFile(properties);
                        }
                        else {
                            // If not logged in, store it to the Session.
                            var sounds = Session.get('audio');
                            sounds.push(properties);
                            Session.set('audio', sounds);
                        }
                  //  });
                });
            }
        }
    };
    
    return init();
}();
