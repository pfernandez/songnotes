/*
This file will be executed only on the client, after everthing else in
lib/ but before any other client directories.
*/

// Client global variables
contentHasFocus = false; // for returning focus to content on hot reload
recordingAllowed = userCanAddSounds();
Session.setDefault('saving', false);
Session.setDefault('recording', false);
Session.setDefault('playing', false);
Session.set('delete_dialog', {_id: null, title: ''});

var justLoggedIn = false;   // so we can store an entered song on login

// Retrieve the current song ID and title on login or refresh.
Deps.autorun(function() {

    if(Meteor.loggingIn()) {
        justLoggedIn = true;
    }

    var userId = Meteor.userId();
    
    if(userId && ! song.id()) {
        // If there was a song begun before login, add it to the database.
        // Otherwise load the most recent song.
        if(justLoggedIn) {
        
            var titleElement = document.getElementById('song-title'),
                contentElement = document.getElementById('content'),
                newTitle = null,
                newContent = null;
                
            if(titleElement) {
                var newTitle = titleElement.value;
            }
            
            if(contentElement) {
                var newContent = contentElement.innerHTML;
            }
            
            if(newTitle || newContent || ! _.isEmpty(audio.cache.get())) {
                song.add({title: newTitle, content: newContent});
            }
            
            if(typeof toggleLists == 'function') {
                toggleLists();
            }
            
            justLoggedIn = false;
        }
        song.loadMostRecent();
    }
    else if(! userId && song.id()) {
        // The user just logged out, so remove the current song.
        song.id(null);
    }
});


// Handle back and forward buttons so that the url always corresponds to the
// current state of the app. Works together with song.id().
window.onpopstate = function(e) {

    if(! Meteor.userId()) {
        // If not logged in, always show just the root url.
        window.history.replaceState({}, '', '.');
    }
    else if(e.state) { 
        
        if(e.state._id) {
            // Load the song corresponding to the url.
            song.id(e.state._id);
        }
        else {
            // If the url is blank, set it to the current song id.
            var songId = song.id();
            if(songId) {
                window.history.replaceState({_id: songId}, '', songId);
            }
        }
    }
}


// Display song lists as either full or collapsed depending on window width.
toggleLists = function() {

    var buttons = document.getElementsByClassName('collapse-btn'),
        lists = document.getElementsByClassName('mobile-collapse'),
        icons = document.getElementsByClassName('collapse-icon');
    
    var goForIt = function() {

        if(window.innerWidth > 991) {
            for(var i = 0; i < lists.length; i++) {
                buttons[i].dataset['toggle'] = '';
                if(! buttons[i].classList.contains('not-btn')) {
                    buttons[i].classList.add('not-btn');
                }
                lists[i].classList.remove('collapse');
                icons[i].classList.remove('glyphicon-chevron-down');
            }
        }
        else {
            for(var i = 0; i < lists.length; i++) {
                buttons[i].dataset['toggle'] = 'collapse';
                buttons[i].classList.remove('not-btn');
                if(! lists[i].classList.contains('collapse')) {
                    lists[i].classList.add('collapse');
                    icons[i].classList.add('glyphicon-chevron-down');
                }
            }
        }
    }
    
    // Sometimes the lists array takes a moment to show up. If that's the case,
    // pause before proceeding.
    if(! lists.item(0)) {
        setTimeout(function() { goForIt(); }, 750);
    }
    else {
        goForIt();
    }
}
window.onload = window.onresize = function() { toggleLists(); }
