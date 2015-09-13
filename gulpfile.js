var gulp = require('gulp');


gulp.task('seed', function(){
  require('./seeds');
});

var sass = require('gulp-sass');
 
gulp.task('sass', function () {
  gulp.src('assets/css/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('public/css'));
});
 
gulp.task('sass:watch', ['sass'], function () {
  gulp.watch('assets/css/**/*.scss', ['sass']);
});
