audio = function() {

    var audioContext,
        audioInput,
        audioRecorder,
        source,
        playing,
        recording = null;

    var init = function() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        return methods;
    }
    
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
                audioRecorder = new Recorder(audioInput);
                callback && callback();
            },
            
            function(err) {
                console.log('Error getting audio: ' + err);
                recording = false;
            }
        );
    }
    
    var BinaryFileReader = {
      read: function(file, callback){
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
    }
    
    var blobReady = function(callback) {
        audioRecorder.getBuffer(function(buffers) {
            audioRecorder.exportWAV(function(blob) {
                callback(blob);
            });
        });
    }
    
    // Attempt to add a new sound to the server. Returns unique sound ID
    // if successful.
    var save = function() {
     
        // Save as Uint8Array
        audioRecorder.exportWAV(function(blob) {
            BinaryFileReader.read(blob, function(err, properties) {
                properties.songId = song.id();
                if(Meteor.userId()) {
                    Meteor.call('newSound', properties,
                        function(error, newSound) {
                            if(error) {
                                console.log(error.reason);
                            }
                        }
                    );
                }
                else {
                    var sounds = Session.get('audio');
                    sounds.push(properties);
                    Session.set('audio', sounds);
                }
            });
        });
        
    /* Save as normal arrays
        audioRecorder.getBuffer(function(buffers) {
            var properties = {
                songId: song.id(),
                file: [
                    Array.prototype.slice.call(buffers[0]), 
                    Array.prototype.slice.call(buffers[1])
                ]
            };
            Meteor.call('newSound', properties, function(error, newSound) {
                if(error) {
                    console.log(error.reason);
                }
            });
        });*/
    }
    
    var stopRecording = function() {
        audioRecorder.stop();
        recording = false;
    }

    var methods = {
    
        record: function() {
        
            // Initialize getUserMedia on first usage.
            if(recording === null) {
                initGetUserMedia(function() {
                    recording = true;
                    audioRecorder.record();
                });
            }
            else if(! recording && ! playing) {
                recording = true;
                audioRecorder.clear();
                audioRecorder.record();
            }
        },
        
        stop: function() {
            if(recording) {
                stopRecording();
                save();
            }
            else if(playing){
                source.stop();
                playing = false;
            }
        },
    
        play: function(loop) {
            if(recording) {
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
            blobReady(function(blob) {
                Recorder.forceDownload(blob);
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
        }
    }
    
    return init();
}();
