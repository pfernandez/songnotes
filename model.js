////////////////////////////////////////////////////////////////////////////////
// Songs: { title, content, ownerId }

MAX_SONGS_PER_USER = 10;
MAX_SOUNDS_PER_SONG = 10;

Songs = new Meteor.Collection('songs');

Songs.allow({
    insert: function(userId, doc) {
        // Users must be logged in, and the document must be owned by the user.
        return (userId && doc.ownerId === userId);
    },
    update: function(userId, doc, fields, modifier) {
        // Users can only edit their own documents.
        return doc.ownerId === userId;
    },
    remove: function(userId, doc) {
        // Users can only remove their own documents.
        return doc.ownerId === userId;
    },
    fetch: ['ownerId']
});

Songs.deny({
    update: function(userId, docs, fields, modifier) {
        // The user may only edit particular fields.
        return (_.without(fields, 'title', 'content').length > 0);
    }
});

Meteor.methods({

    // Insert a new song into the database.
    newSong: function(properties) {
    
        var user = Meteor.userId();
    
        if(user && userCanAddSongs()) {
        
            if(! properties) {
                properties = {};
            }
            
            if(properties.title) {
                properties.title = getUniqueTitle(properties.title);
            }
            else {
                properties.title = '';
            }
            
            if(! properties.content) {
                properties.content = '';
            }
        
            // Make sure only allowed properties are inserted.
            var song = _.extend(_.pick(properties, 'title', 'content'), {
                ownerId: user, created: new Date().getTime()
            });

            properties._id = Songs.insert(song);
            
            return properties;
        }
    },
});

// Returns a cursor of songs belonging to the specified user.
getSongList = function(userId) {
    var songList = Songs.find({ownerId: userId},
        {sort: {created: 1}}, {fields: {title: 1}});
    if(songList.count() > 0) {
        return songList;
    }
    else {
        return null;
    }
}

// Returns whether the max number of songs has been reached.
userCanAddSongs = function() {
    var songList = getSongList(Meteor.userId()),
        count = songList ? songList.count() : 0,
        result = (count < MAX_SONGS_PER_USER) ? true : false;
    return result;
}

// Returns whether the max number of sounds has been added to the currrent song.
userCanAddSounds = function() {
    var user = Meteor.users.findOne({_id: Meteor.userId()}, 
            {fields: {currentSongId: 1}}),
        songId = user ? user.currentSongId : null;
        sounds = Sounds.find({'songId': songId}, {fields: {_id: 1}}),
        count = sounds ? sounds.count() : 0,
        result = (count < MAX_SOUNDS_PER_SONG) ? true : false;
    return result;
}

// If the desired title is not unique, append an integer to it.
getUniqueTitle = function(title) {

    var songList = getSongList(Meteor.userId());
    
    if(songList) {
    
        if(! title) {
            title = 'Untitled Song';
        }
        
        var songs = songList.fetch(),
        newTitle = title,
        matchFound = true,
        count = 1;
        
        while(matchFound) {
            matchFound = false;
            for(var i = 0; i < songs.length; i++) {
                if(newTitle === songs[i].title) {
                    newTitle = title + ' ' + count;
                    matchFound = true;
                    count++;
                }
            }
        }
        
        if(count > 1) {
            title = newTitle;
        }
    }
    
    return title;
}


////////////////////////////////////////////////////////////////////////////////
// Meteor.users: { currentSong }

Sounds = new Meteor.Collection('sounds');

Sounds.allow({
    insert: function(userId, doc) {
        // Users must be logged in, and the document must be owned by the user.
        return (userId && doc.ownerId === userId);
    },
    update: function(userId, doc, fields, modifier) {
        // Users can only edit their own documents.
        return doc.ownerId === userId;
    },
    remove: function(userId, doc) {
        // Users can only remove their own documents.
        return doc.ownerId === userId;
    },
    fetch: ['ownerId']
});

Sounds.deny({
    update: function(userId, docs, fields, modifier) {
        // The user may only edit particular fields.
        return (_.without(fields, 'title').length > 0);
    }
});

Meteor.methods({

    // Insert a new song into the database.
    newSound: function(properties) {
    
        var user = Meteor.userId();
            
        if(user && userCanAddSounds()) {
        
            properties = properties || {};
            
            if(! properties.songId) {
                throw new Error('Could not store sound: no song ID.');
            }
            else {
                var songs = Songs.find(
                    {_id: properties.songId}, {fields: {_id: 1}});
                if(! songs || songs.count() < 1) {
                    throw new Error('Could not store sound: invalid song ID.');
                }
            }
            if(! properties.file)
                throw new Error('Could not store sound: no file provided.');
            if(! properties.size)
                throw new Error('Could not store sound: no size provided.');
            if(! properties.type)
                throw new Error('Could not store sound: no type provided.');
            if(! properties.title)
                properties.title = '';
        
            // Make sure only allowed properties are inserted.
            var sound = _.extend(
                _.pick(properties, 'songId', 'title', 'file', 'size', 'type'), {
                    ownerId : user,
                    songId  : properties.songId,
                    title   : properties.title,
                    file    : properties.file,
                    size    : properties.size,
                    type    : properties.type,
                    created : new Date().getTime(),
                }
            );

            properties._id = Sounds.insert(sound);
            return properties;
        }
    },
});


////////////////////////////////////////////////////////////////////////////////
// Meteor.users: { currentSong }

Meteor.users.allow({
    update: function(userId, doc, fields, modifier) {
        // Users can only update the current song ID.
        return (fields.length === 1 && _.contains(fields, 'currentSongId'));
    }
});

