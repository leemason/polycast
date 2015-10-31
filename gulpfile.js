var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    rename = require("gulp-rename"),
    webpack = require("webpack");

var webpackConfig = {
    entry: './assets/js/polycast.js',
    output: {
        path: './dist/js',
        filename: 'polycast.js',
        library: 'Polycast',
        libraryTarget: 'umd'
    }
};

gulp.task('default', ['uglify'], function(){

});

gulp.task('watch', function(){
    return gulp.watch(["./assets/js/polycast.js"], ["default"]);
});


gulp.task('uglify', ['webpack:build'], function() {
    return gulp.src('dist/js/polycast.js')
        .pipe(uglify())
        .pipe(rename('polycast.min.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('webpack:build', function(cb){
    webpack(webpackConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build", err);
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        cb();
    });
});