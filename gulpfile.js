/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require("gulp");
const ts = require('gulp-typescript');
const del = require('del');

const tsProject = ts.createProject('./tsconfig.json');

// Clean dist folder
gulp.task('clean', () => del('dist'));

// Build ts
gulp.task('build', () => tsProject.src()
  .pipe(tsProject())
  .pipe(gulp.dest('dist')));

// Copy files
gulp.task('copy:graphql', () => gulp.src('src/api/api.graphql')
  .pipe(gulp.dest('dist/api')));

gulp.task('copy', gulp.parallel(
  'copy:graphql'
));

// Default task
gulp.task('default', gulp.series('clean', 'build', 'copy'));