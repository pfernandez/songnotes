Router.map( function() {

    this.route('song', {
        path: '/:_id?',
        layoutTemplate: 'layout',
        loadingTemplate: 'loading',
        yieldTemplates: {
            'deleteSongDialog': {to: 'deleteSongDialog'},
            'songList': {to: 'aside'}
        },
        waitOn: function() {
            Session.set('song_id', this.params._id);
            return [Meteor.subscribe('songs', this.params._id), Meteor.subscribe('userData')];
        }
    });
});

