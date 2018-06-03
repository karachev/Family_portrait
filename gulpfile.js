var gulp = require('gulp');
var jade = require('gulp-jade');
var htmlmin = require('gulp-htmlmin');
var sass = require('gulp-sass');
var connect = require('gulp-connect');
var runSequence = require('run-sequence');
var watch = require('gulp-watch');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var spritesmith = require('gulp.spritesmith');
var merge = require('merge-stream');
var sourcemaps = require('gulp-sourcemaps');
var GulpSSH = require('gulp-ssh');
var fs = require('fs');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var del = require('del');
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var gulpDeployFtp = require('gulp-deploy-ftp');

var config = {
  styles: './src/scss/**/*.scss',
  scripts: './src/js/**/*',
  images: './src/img/**/*',
  fonts: './src/fonts/*'
};

gulp.task('default', ['build', 'watch', 'connect']);
gulp.task('build', ['styles', 'scripts', 'static']);

gulp.task('static', ['images', 'fonts', 'copy:index']);

gulp.task('connect', function() {
 connect.server({
    root: 'build',
    livereload: true
  });
});

gulp.task('copy:index', function () {
    return gulp.src('./src/index.html')
        .pipe(htmlmin())
        .pipe(gulp.dest('build/'))
});

gulp.task('styles', function() {
  return gulp.src('./src/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('build/assets/css/'));
});

gulp.task('images', function() {
  return gulp.src(config.images)
    .pipe(gulp.dest('build/assets/img/'))
});

gulp.task('fonts', function() {
  return gulp.src(config.fonts)
    .pipe(gulp.dest('build/assets/fonts/'))
});

gulp.task('scripts', function() {
  browserify({
    entries: './src/js/index.js'
  }).bundle()
    .on('error', function (err) {
      console.log(err.toString());
      this.emit("end");
    })
    .pipe(source('main.js'))
    .pipe(gulp.dest('./build/assets/js/'));
});

gulp.task('productionJS', function() {
  gulp.src('./build/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build/'))
});

gulp.task('productionCSS', function() {
  gulp.src('./build/**/*.css')
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: true
    }))

    .pipe(csso())
    
    .pipe(gulp.dest('./build/'))
});

gulp.task('productionIMG', function() {
  gulp.src(['./build/assets/*.jpg', './build/assets/*.png'])
    .pipe(imagemin())
    .pipe(gulp.dest('./build/assets/'))
});

gulp.task('gzip', function() {
  gulp.src('./build/**/*')
    .pipe(gzip())
    .pipe(gulp.dest('./build/'))
});

gulp.task('clean', function() {
  return del('./build/**/*')
});

gulp.task('watch', function() {
  gulp.watch(config.styles,    ['styles']);
  gulp.watch(config.scripts,   ['scripts']);
  gulp.watch('./src/index.html',     ['copy:index']);
  gulp.watch(config.images,    ['images']);
  gulp.watch(config.fonts,     ['fonts']);

  watch('build/**').pipe(connect.reload());
});

