'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var del = require('del');
var wiredep = require('wiredep');
var $ = require('gulp-load-plugins')();
var reload = browserSync.reload;

gulp.task('html', function () {
    return gulp.src('app/*.html').pipe($.useref({ searchPath: ['.tmp', 'app', '.'] })).pipe($.if('*.js', $.uglify())).pipe($.if('*.css', $.cssnano())).pipe($.if('*.html', $.htmlmin({ collapseWhitespace: true }))).pipe(gulp.dest('dist'));
});

gulp.task('extras', function () {
    return gulp.src(['app/*.*', '!app/*.html'], {
        dot: true
    }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['build'], function () {
    (0, browserSync)({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['.tmp', 'app'],
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch(['app/*.html', 'app/images/**/*', 'app/styles/*', 'app/scripts/*', '.tmp/fonts/**/*']).on('change', reload);

    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('serve:dist', function () {
    (0, browserSync)({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['dist']
        }
    });
});

// inject bower components
gulp.task('wiredep', function () {
    gulp.src('app/styles/*.scss').pipe((0, wiredep.stream)({
        ignorePath: /^(\.\.\/)+/
    })).pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html').pipe((0, wiredep.stream)({
        ignorePath: /^(\.\.\/)*\.\./
    })).pipe(gulp.dest('app'));

    gulp.src('app/index.html')
});


gulp.task('build', ['html', 'extras', 'wiredep'], function () {
    return gulp.src('dist/**/*');
});

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});