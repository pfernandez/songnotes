Router.map( function() {

    this.route('song', {
        path: '/',
        layoutTemplate: 'layout',
        loadingTemplate: 'loading',
        yieldTemplates: {'songList': {to: 'aside'}},
        waitOn: function() {
            return [Meteor.subscribe('songs'), Meteor.subscribe('userData')];
        }
    });
});

// The path could be songnot.es/artists/username/songname (if user names
// are unique). Not including "artists" would prevent the free
// creation of new subpages below songnot.es/.
