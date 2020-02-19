var setup = {
  proxyHost: 'localhost/wp-test'
}

var gulp = require("gulp");
var sass = require("gulp-sass"); //Sass to css
var browserSync = require("browser-sync").create(); //browser-sync reload browser
var imagemin = require("gulp-imagemin"); // min image
var cache = require("gulp-cache");
var del = require("del"); // clear project files
var notify = require("gulp-notify");
var postcss = require("gulp-postcss");
var sourcemaps = require("gulp-sourcemaps");
var autoprefixer = require("autoprefixer");
var babel = require("gulp-babel");
var plumber = require("gulp-plumber");
var wait = require("gulp-wait");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");

var paths = {
  php: ["../*.php"],
  scss: ["../scss/**/*.scss"],
  scripts: ["../scripts/**/*.js"],
  image: ["../assets/images/**/*.+(png|jpg|jpeg|gif|svg|JPG)"],
  fonts: ["../assets/fonts/**/*"],
  video: ["../assets/video/**/*"]
};




gulp.task("css", function () {
  return gulp
    .src(paths.scss) // Gets all files ending with .scss in app/scss
    .pipe(wait(500))
    .pipe(sass())
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("../assets/css"))
    .pipe(notify("Done!"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
}); //Sass to css task

gulp.task("js", function () {
  return gulp
    .src(paths.scripts)
    .pipe(wait(500))
    .pipe(plumber())
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(gulp.dest("../assets/js"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});


gulp.task("images", function () {
  return (
    gulp
      .src(paths.image)
      // Caching images that ran through imagemin
      .pipe(
        cache(
          imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
              plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
            })
          ])
        )
      )
      .pipe(gulp.dest("dist/images"))
  );
}); // min image

gulp.task("webp", function () {
  return gulp
    .src("../assets/images/**/*.{png,jpg}")
    .pipe(
      webp({
        quality: 90
      })
    )
    .pipe(gulp.dest("dist/images"));
}); // Create WebP image

gulp.task("sprite", function () {
  return gulp
    .src("../assets/images/icon-*.svg")
    .pipe(
      svgstore({
        inlineSvg: true
      })
    )
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("dist/images"));
});

gulp.task("fonts", function () {
  return gulp.src(paths.fonts).pipe(gulp.dest("dist/fonts"));
}); // Copy fonts to folder dist

gulp.task("video", function () {
  return gulp.src(paths.video).pipe(gulp.dest("dist/video"));
}); // Copy fonts to folder dist

gulp.task("clean:dist", function () {
  return del("dist");
}); // clear dist

gulp.task("browserSync", function () {
  browserSync.init({

    proxy: {
      target: setup.proxyHost
    },
    port: 8080,
    open: true,
    //notify: false
  });
}); //browserSync


gulp.task(
  "build",
  gulp.series(
    "clean:dist",
    "css",
    "images",
    "fonts",
    "video"

  )
); //build

gulp.task("watch", function () {
  gulp.watch(paths.scss, gulp.parallel("css"));
  gulp.watch(paths.scripts, gulp.parallel("js"));
  gulp.watch(paths.php, browserSync.reload({
    stream: true
  }));
}); // Gulp watch tack

gulp.task(
  "default",
  gulp.parallel("watch", "js", "css", "browserSync")
); // default
