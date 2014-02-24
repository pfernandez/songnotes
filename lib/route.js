Router.map( function() {

    this.route('editor', {
        path: '/:_id?',
        layoutTemplate: 'layout',
        loadingTemplate: 'loading',
        yieldTemplates: {
            'deleteSongDialog': {to: 'deleteSongDialog'},
            'controls': {to: 'controls'},
            'songList': {to: 'songList'},
            'recordings': {to: 'recordings'}
        },
        waitOn: function() {
            Session.set('song_id', this.params._id);
            return [Meteor.subscribe('songs', this.params._id), Meteor.subscribe('userData')];
        }
    });
});

