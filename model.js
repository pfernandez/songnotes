////////////////////////////////////////////////////////////////////////////////
// Songs: { title, lyrics, ownerId }

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
        return (_.without(fields, 'title', 'lyrics').length > 0);
    }
});

Meteor.methods({

    // Insert a new song into the database.
    newSong: function(properties) {
    
        var user = Meteor.userId();
    
        if(user) {
        
            if(! properties) {
                properties = {};
            }
            
            properties.title = getUniqueTitle(properties.title);
            
            if(! properties.lyrics) {
                properties.lyrics = '';
            }
        
            // Make sure only allowed properties are inserted.
            var song = _.extend(_.pick(properties, 'title', 'lyrics'), {
                ownerId: user, created: new Date().getTime()
            });

            properties._id = Songs.insert(song);
            
            return properties;
        }
    },
});

// Returns a cursor of songs belonging to the specified user.
getSongList = function(userId) {
    return Songs.find({ownerId: userId}, {fields: {title: 1}});
}

// If the desired title is not unique, append and integer to it.
getUniqueTitle = function(title) {

    if(! title) {
        title = 'Untitled Song';
    }

    var songs = getSongList(Meteor.userId()).fetch(),
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
    
    return title;
}



////////////////////////////////////////////////////////////////////////////////
// Meteor.users: { currentSong }

Meteor.users.allow({
    update: function(userId, doc, fields, modifier) {
        // Users can only update the current song ID.
        return (fields.length === 1 && _.contains(fields, 'currentSongId'));
    }
});
