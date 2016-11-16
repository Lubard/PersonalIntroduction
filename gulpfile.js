/**
 * Created by William on 30/10/16.
 */
// requirements

var gulp = require('gulp');
var gulpBrowser = require("gulp-browser");
var reactify = require('reactify');
var del = require('del');
var size = require('gulp-size');


// tasks

gulp.task('transform', function () {
  var stream = gulp.src('./static/script/jsx/*.js')
    .pipe(gulpBrowser.browserify({transform: ['reactify']}))
    .pipe(gulp.dest('./static/script/js/'))
    .pipe(size());
  return stream;});

gulp.task('del', function () {
  return del(['./static/script/js']);
});

gulp.task('default', ['del'], function () {
  gulp.start('transform');
  gulp.watch('./static/script/jsx/*.js', ['transform']);
});