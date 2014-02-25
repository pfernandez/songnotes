audio = function() {

    var audioContext,
        audioInput,
        audioRecorder,
        source,
        playing,
        recording = null;

    function init() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        return methods;
    }
    
    function initGetUserMedia(callback) {

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
                audioRecorder.stop();
                recording = false;
            }
            else if(playing){
                source.stop();
                playing = false;
            }
        },
    
        play: function(loop) {
            if(recording) {
                audioRecorder.stop();
                recording = false;
            }
            if(! playing && recording !== null) {
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

    }
    
    return init();
}();
