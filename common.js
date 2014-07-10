////////////////////////////////////////////////////////////////////////////////
// Songs: { title, content, ownerId }

MAX_SONGS_PER_USER = 10;
MAX_SOUNDS_PER_SONG = 10;
MAX_SECONDS_PER_SOUND = 60;

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
        
            properties = properties || {};
            properties.ownerId = user;
            properties.created = Date.now();
            properties.title   = getUniqueTitle(properties.title);
            properties.content = properties.content || '';
        
            // Make sure only allowed properties are inserted.
            var properties = _.pick(properties,
                'title', 'content', 'ownerId', 'created');

            properties._id = Songs.insert(properties);
            
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

    if(! title) {
        return '';
    }

    var songList = getSongList(Meteor.userId());
    
    if(songList) {
        
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

var soundStore = new FS.Store.FileSystem("sounds", {
    path: "~/ad/songnotes/.uploads"
});

Sounds = new FS.Collection("sounds", {
    stores: [soundStore],
    filter: {
      allow: {
        contentTypes: ['audio/*']
      }
    },
    onInvalid: function (message) {
      if (Meteor.isClient) {
        alert(message);
      } else {
        console.log(message);
      }
    }
});

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
    download: function(userId, doc) {
        // Users can only download their own documents.
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
            properties.ownerId = user;
            properties.created = properties.created || Date.now();
            properties.title = properties.title || '';
            
            if(! properties.file)
                throw new Error('Could not store sound: no file provided.');
            if(! properties.size)
                throw new Error('Could not store sound: no size provided.');
            if(! properties.type)
                throw new Error('Could not store sound: no type provided.');
            if(! properties.songId) {
                throw new Error('Could not store sound: no song ID.');
            }
            else {
                // Confirm that the song exists.
                var songs = Songs.find(
                    {_id: properties.songId}, {fields: {_id: 1}});
                if(! songs || songs.count() < 1) {
                    throw new Error('Could not store sound: invalid song ID.');
                }
            }
        
            // Make sure only allowed properties are inserted.
            var properties = _.pick(properties, 'ownerId',
                'songId', 'title', 'file', 'size', 'type', 'created');

            properties._id = Sounds.insert(properties);
            
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

