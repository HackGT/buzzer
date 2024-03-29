/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require("gulp");
const ts = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");

const tsProject = ts.createProject("./tsconfig.json");

// Clean dist folder
gulp.task("clean", () => del("dist"));

// Build ts
gulp.task("build", () =>
  tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "../src" }))
    .pipe(gulp.dest("dist"))
);

// Copy files
gulp.task("copy:graphql", () => gulp.src("src/api/api.graphql").pipe(gulp.dest("dist/api")));

gulp.task("copy:email-template", () =>
  gulp.src("src/email-template/*").pipe(gulp.dest("dist/email-template"))
);

gulp.task("copy", gulp.parallel("copy:graphql", "copy:email-template"));

// Default task
gulp.task("default", gulp.series("clean", "build", "copy"));
