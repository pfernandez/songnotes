/*
This file will be executed only on the client, after everthing else in
lib/ but before any other client directories.
*/


// Client global variables
contentHasFocus = false; // used to return focus to content on hot reload
Session.setDefault('saving', false);
Session.setDefault('songToDelete', {_id: null, title: null});

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
            
            if(newTitle || newContent) {
                song.add({title: newTitle, content: newContent});
            }
            
            justLoggedIn = false;
        }
        
        song.loadMostRecent();
    }
    else if(! userId && song.id()) {
        // The user just logged out, so remove the current song.
        song.id(null);
        
        // This is a hack, because the title wasn't re-rendering on logout.
        //document.getElementById('song-title').value = '';
    }
});
