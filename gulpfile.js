// https://kontra.agency/modern-wordpress-theme-development-with-gulp-js-a-guide/

const dir = { src: "src/", build: "build/" };
// Gulp and plugins
const gulp = require("gulp");
const gutil = require("gulp-util");
const newer = require("gulp-newer");
const imagemin = require("gulp-imagemin");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const deporder = require("gulp-deporder");
const concat = require("gulp-concat");
const stripdebug = require("gulp-strip-debug");
const uglify = require("gulp-uglify");
// Browser-sync
let browsersync = false;
// PHP settings
const php = { src: dir.src + "template/**/*.php", build: dir.build };
// copy PHP files
const phpTask = () => {
  return gulp.src(php.src).pipe(newer(php.build)).pipe(gulp.dest(php.build));
};

exports.phpTask = phpTask;

// image settings
const images = { src: dir.src + "images/**/*", build: dir.build + "images/" };
// image processing
const imagesTask = () => {
  return gulp
    .src(images.src)
    .pipe(newer(images.build))
    .pipe(imagemin())
    .pipe(gulp.dest(images.build));
};

exports.imagesTask = imagesTask;

// CSS settings
const css = {
  src: dir.src + "scss/style.scss",
  watch: dir.src + "scss/**/*",
  build: dir.build,
  sassOpts: {
    outputStyle: "nested",
    imagePath: images.build,
    precision: 3,
    errLogToConsole: true,
  },
  processors: [
    require("postcss-assets")({
      loadPaths: ["images/"],
      basePath: dir.build,
      baseUrl: "/wp-content/themes/wptheme/",
    }),
    require("autoprefixer")({ browsers: ["last 2 versions", "> 2%"] }),
    require("css-mqpacker"),
    require("cssnano"),
  ],
};
// CSS processing
const cssTask = () => {
  return gulp
    .src(css.src)
    .pipe(sass(css.sassOpts))
    .pipe(postcss(css.processors))
    .pipe(gulp.dest(css.build))
    .pipe(browsersync ? browsersync.reload({ stream: true }) : gutil.noop());
};

exports.cssTask = cssTask;

// JavaScript settings
const js = {
  src: dir.src + "js/**/*",
  build: dir.build + "js/",
  filename: "scripts.js",
};
// JavaScript processing
const jsTask = () => {
  return gulp
    .src(js.src)
    .pipe(deporder())
    .pipe(concat(js.filename))
    .pipe(stripdebug())
    .pipe(uglify())
    .pipe(gulp.dest(js.build))
    .pipe(browsersync ? browsersync.reload({ stream: true }) : gutil.noop());
};

exports.jsTask = jsTask;

exports.build = () => {
  gulp.series(php, css, js);
};

// Browsersync options
const syncOpts = {
  proxy: "localhost",
  files: dir.build + "**/*",
  open: false,
  notify: false,
  ghostMode: false,
  ui: { port: 8001 },
};
// browser-sync
const browsersyncTask = () => {
  if (browsersync === false) {
    browsersync = require("browser-sync").create();
    browsersync.init(syncOpts);
  }
};

exports.browsersyncTask = browsersyncTask;

// watch for file changes gulp.task('watch', ['browsersync'], () => { // page changes gulp.watch(php.src, ['php'], browsersync ? browsersync.reload : {}); // image changes gulp.watch(images.src, ['images']); // CSS changes gulp.watch(css.watch, ['css']); // JavaScript main changes gulp.watch(js.src, ['js']); });

// default task gulp.task('default', ['build', 'watch']);
