var gulp          = require("gulp"),
    source        = require("vinyl-source-stream"),
    buffer        = require("vinyl-buffer"),
    gutil         = require("gulp-util"),
    preprocess    = require("gulp-preprocess"),
    includer      = require("gulp-x-includer"),
    uglify        = require('gulp-uglify-es').default,
    sourcemaps    = require("gulp-sourcemaps"),
    assign        = require("lodash.assign"),
    autoprefixer  = require("gulp-autoprefixer"),
    del           = require("del");


//----------------------------------------------------
// blow-off previous destination files and folders
//----------------------------------------------------
gulp.task("clean", function () {
  return del(["./dest/domain/**/*"]);
});


//----------------------------------------------------
// build and move index.html to destination
//----------------------------------------------------
gulp.task("build_html_debug", function() {
  gulp.src("./src/domain/index.html")
    .pipe(preprocess({context: { NODE_ENV: "debug", DEBUG: true}}))
    .pipe(gulp.dest("./dest/domain"));
  gulp.src("./src/domain/favicon.png")
    .pipe(gulp.dest("./dest/domain"));
});

gulp.task("build_html", function() {
  gulp.src("./src/domain/index.html")
    .pipe(preprocess({context: { NODE_ENV: "org", DEBUG: true}}))
    .pipe(gulp.dest("./dest/domain"));
  gulp.src("./src/domain/favicon.png")
    .pipe(gulp.dest("./dest/domain"));
});


//----------------------------------------------------
// move audio files to destination
//----------------------------------------------------
gulp.task("build_audio", function() {
  gulp.src("./src/domain/audio/**/*")
    .pipe(gulp.dest("./dest/domain/audio"));
});


//----------------------------------------------------
// move css files to destination
//----------------------------------------------------
gulp.task("build_css", function() {
  gulp.src("./src/domain/css/**/*")
    .pipe(gulp.dest("./dest/domain/css"));
});


//----------------------------------------------------
// move image files to destination
//----------------------------------------------------
gulp.task("build_images", function() {
  gulp.src(["./src/domain/images/**/*"])
    .pipe(gulp.dest("./dest/domain/images/"));
});

//----------------------------------------------------
// use individual javascript files for easy debugging 
//----------------------------------------------------
gulp.task("build_js_debug", function() {
  gulp.src(["./src/domain/js/base.js"])
    .pipe(gulp.dest("./dest/domain/js/"));
  gulp.src(["./src/domain/js/adapter.js"])
    .pipe(gulp.dest("./dest/domain/js/"));
  gulp.src(["./src/domain/js/global.js"])
    .pipe(gulp.dest("./dest/domain/js/"));
  gulp.src(["./src/domain/js/project.js"])
    .pipe(gulp.dest("./dest/domain/js/"));
  gulp.src(["./src/domain/js/webrtc.js"])
    .pipe(gulp.dest("./dest/domain/js/"));

});

gulp.task("build_js_org", function() {
    gulp.src(["./src/domain/js/index.js"])
    .pipe(includer())
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest("./dest/domain/js"))
    .on("error", gutil.log.bind(gutil, gutil.colors.red(
      "\n*********************************** " +
      "\nASSEMBLE REMOTE INDEX.JS ERROR:" +
      "\n*********************************** \n\n"
    )));
});


//----------------------------------------------------
// build the signaling server 
//----------------------------------------------------
gulp.task("build_debug_digitalharvestingworks_server", function() {
  gulp.src("./src/domain/org_digitalharvestingworks_server.js")
    .pipe(preprocess({context: { NODE_ENV: "debug", DEBUG: true}})) 
    .pipe(gulp.dest("./dest/domain"));
});

gulp.task("build_org_digitalharvestingworks_server", function() {
  gulp.src("./src/domain/org_digitalharvestingworks_server.js")
    .pipe(preprocess({context: { NODE_ENV: "org", DEBUG: false}})) 
    .pipe(gulp.dest("./dest/domain"));
});

gulp.task("default", ["clean", "build_html_debug", "build_audio", "build_css", "build_images", "build_js_debug", "build_debug_digitalharvestingworks_server"]);
gulp.task("org", ["clean", "build_html", "build_audio", "build_css", "build_images", "build_js_org", "build_org_digitalharvestingworks_server"]);


