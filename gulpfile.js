var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require("gulp-rename");

gulp.task('default', function() {
    return gulp.src('assets/js/polycast.js')
        .pipe(uglify())
        .pipe(rename('polycast.min.js'))
        .pipe(gulp.dest('assets/js'));
});