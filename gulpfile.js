var gulp = require('gulp');
var shell = require('gulp-shell');

require('./build/gulp/jshint');

gulp.task('server',
    shell.task([
        'npm run server'
    ])
);

gulp.task('watch', ['jshint'], function() {
    gulp.watch(require('./build/gulp/jshintSrc'), ['jshint']);
});

gulp.task('default', ['watch']);