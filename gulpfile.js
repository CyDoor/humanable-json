'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var UglifyJS = require('uglify-js');
var map = require('vinyl-map');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var mocha = require('gulp-mocha');

var production = (process.env.NODE_ENV === 'production');
/**
 * Run .js files through jshint
 */
gulp.task('jshint', function taskJSHint() {
  return gulp.src('lib/**.js')
    .pipe(plumber())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));
});

/**
 * Watch and run .js files through jshint
 */
gulp.task('jshint-watch', function taskJSHint() {
  watch({
    glob: 'lib/**/*.js',
    name: 'jshint-changed',
    emitOnGlob: true,
    emit: 'one'
  }, function (files) {
    return files
      .pipe(plumber())
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter(stylish));
  });

});

/**
 * Run .js files through UglifyJS
 */
gulp.task('uglify', function taskUglify() {

  var uglify = map(function (buff, filename) {
    var u = UglifyJS.minify(filename, {
    });
    return u.code;
  });

  return gulp.src('dist/humanable-json.js')
    .pipe(uglify)
    .pipe(concat('humanable-json.min.js'))
    .pipe(gulp.dest('dist'));
});

/**
 * Build file (browserify)
 */
gulp.task('build', function taskBuild() {

  return gulp.src('./lib/humanable-json.js')
    .pipe(plumber())
    .pipe(transform(function (filename) {
      var b = browserify(filename, {
        debug: !production
      });
      return b.bundle();
    }))
    .pipe(gulp.dest('./dist'));
});

/**
 * Watch and build files (browserify)
 */
gulp.task('build-watch', function () {
  watch({
    glob: 'lib/**/*.js',
    name: 'build-changed',
    emitOnGlob: true,
    emit: 'one'
  }, function (files) {
    gulp.src('./lib/humanable-json.js')
      .pipe(plumber())
      .pipe(transform(function (filename) {
        var b = browserify(filename, {
          debug: !production
        });
        return b.bundle();
      }))
      .pipe(gulp.dest('./dist'));

    return files;
  });
});

gulp.task('mocha', function () {
  return gulp.src('./lib/**/*.spec.js', {read: false})
    .pipe(mocha({reporter: 'spec'}));
});
gulp.task('mocha-watch', function () {

  var specFilter = filter(['*.spec.js']);

  gulp.src(['lib/**/*.js'], { read: false })
    .pipe(watch({
      name: 'mocha-changed',
      emitOnGlob: true,
      emit: 'all'
    }, function (files) {
      files
        .pipe(mocha({ reporter: 'spec' }))
        .on('error', function (err) {
          if (!/tests? failed/.test(err.stack)) {
            console.log(err.stack);
          }
        })
        .pipe(specFilter.restore());
    }));
});

gulp.task('develop', ['jshint-watch', 'build-watch', 'mocha-watch']);
gulp.task('release', ['jshint', 'build', 'uglify']);
gulp.task('default', ['develop']);