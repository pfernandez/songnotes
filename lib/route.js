Router.map( function() {

    this.route('editor', {
        path: '/:_id?',
        layoutTemplate: 'layout',
        loadingTemplate: 'loading',
        yieldTemplates: {
            'deleteDialog': {to: 'deleteDialog'},
            'titleBar': {to: 'titleBar'},
            'songList': {to: 'songList'},
            'audio': {to: 'audio'}
        },
        waitOn: function() {
            Session.set('song_id', this.params._id);
            return [
                Meteor.subscribe('songs', this.params._id),
                Meteor.subscribe('sounds'),
                Meteor.subscribe('userData')
            ];
        }
    });
});

