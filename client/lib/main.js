/*
This file will be executed only on the client, after everthing else in
lib/ but before any other client directories.
*/


// Client global variables
contentHasFocus = false; // for returning focus to content on hot reload
Session.setDefault('saving', false);
Session.set('delete_dialog', {_id: null, title: ''});
Session.setDefault('blob_url', ''); // last recorded audio url

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


// Display song lists as either full or collapsed depending on window width.
toggleLists = function() {

    var buttons = document.getElementsByClassName('collapse-btn'),
        lists = document.getElementsByClassName('mobile-collapse'),
        icons = document.getElementsByClassName('collapse-icon');
        
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
window.onresize = function() { toggleLists(); }
