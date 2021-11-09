const {src, dest, parallel, series, watch} = require('gulp');
const autoPrefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const cleanCss = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const del = require('del');

const svgSprites = function() {
    return src('./src/img/**.svg')
      .pipe(svgSprite({
          mode: {
              stack: {
                  sprite: '../img/sprite.svg'
              }
          }
      }))
      .pipe(dest('./dist/img'))
      .pipe(browserSync.stream())
}

const fonts = function() {
    return src('./assets/src/fonts/*.ttf')
      .pipe(ttf2woff())
      .pipe(src('./assets/src/fonts/*.ttf'))
      .pipe(ttf2woff2())
      .pipe(dest('./dist/fonts'))
}

const styles = function() {
    return src('./src/scss/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({
          outputStyle: 'compressed'
      }).on('error', notify.onError()))
      .pipe(rename({
          suffix: '.min'
      }))
      .pipe(autoPrefixer({
          cascade: false,
      }))
      .pipe(cleanCss({
          level: 2
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(dest('./dist/css'))
      .pipe(browserSync.stream())
}

const html = function() {
    return src(['./src/index.html'])
      .pipe(fileInclude({
          prefix: '@@',
          basepath: '@file'
      }))
      .pipe(dest('./dist'))
      .pipe(browserSync.stream())
}

const imgToDist = function() {
    return src(['./src/assets/**/*.jpg', './src/assets/**/*.jpeg', './src/assets/**/*.png'])
      .pipe(dest('./dist/img'))
}

const clean = function() {
    return del(['./dist/*'])
}

const watchFiles = function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });

    watch('./src/scss/**/*.scss', styles);
    watch('./src/index.html', html);
    watch(['./src/assets/**/*.jpg', './src/assets/**/*.jpeg', './src/assets/**/*.png'], imgToDist);
    watch('./src/assets/img/**/*.svg', svgSprites);
    watch('./src/assets/fonts/*.ttf', ttf2woff);
    watch('./src/assets/fonts/*.ttf', ttf2woff2);
}

exports.styles = styles;
exports.watchFiles = watchFiles;
exports.fileInclude = html;

exports.default = series(clean, parallel(html, imgToDist, svgSprites, fonts), styles, watchFiles);