'use strict';

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');
var _wiredep = require('wiredep');
var $ = require('gulp-load-plugins')();
var reload = browserSync.reload;

gulp.task('html', function () {
    return gulp.src('app/*.html').pipe($.useref({ searchPath: ['.tmp', 'app', '.'] })).pipe($.if('*.js', $.uglify())).pipe($.if('*.css', $.cssnano())).pipe($.if('*.html', $.htmlmin({ collapseWhitespace: true }))).pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*').pipe($.cache($.imagemin({
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling
        svgoPlugins: [{ cleanupIDs: false }]
    }))).pipe(gulp.dest('dist/images'));
});

gulp.task('extras', function () {
    return gulp.src(['app/*.*', '!app/*.html'], {
        dot: true
    }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', function () {
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

    gulp.watch(['app/*.html', 'app/images/**/*', '.tmp/fonts/**/*']).on('change', reload);

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

gulp.task('serve:test', function () {
    (0, browserSync)({
        notify: false,
        port: 9000,
        ui: false,
        server: {
            baseDir: 'test',
            routes: {
                '/scripts': '.tmp/scripts',
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch('test/spec/**/*.js').on('change', reload);
});

// inject bower components
gulp.task('wiredep', function () {
    gulp.src('app/styles/*.scss').pipe((0, _wiredep.stream)({
        ignorePath: /^(\.\.\/)+/
    })).pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html').pipe((0, _wiredep.stream)({
        ignorePath: /^(\.\.\/)*\.\./
    })).pipe(gulp.dest('app'));
});

gulp.task('build', ['html', 'images', 'extras'], function () {
    return gulp.src('dist/**/*');
});

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});