var gulp = require('gulp'),
  gutil = require('gulp-util'),
	stylus = require('gulp-stylus'),
	pug = require('gulp-pug'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  cleanCSS = require('gulp-clean-css'),
	autoprefixer = require('gulp-autoprefixer'),
	imagemin = require('compress-images'),
  browserSync = require('browser-sync'),
  pump = require('pump'),
  reload = browserSync.reload;

var src = {
	'dev': {
		'stylus': 'dev/stylus/',
		'jsdir': 'dev/js/*',
		'js': 'dev/js/script.js',
		'progjs': 'dev/js/prog/*',
		'jslibs': 'dev/js/ext/*.js',
		'pug': 'dev/pug/*.pug',
		'imgs': 'dev/img/*',
		'icons': 'dev/i/*'
	},
	'prod': {
		'css': 'prod/static/css',
		'js': 'prod/static/js/',
		'jslibs': 'prod/static/js/ext/',
		'html': 'prod/',
		'imgs': 'prod/img/',
		'icons': 'prod/static/i/'
	}
};

// server started 
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./prod/"
    }
  });
});

// js libs task
gulp.task('js-libs', function (cb) {
  pump([
    gulp.src(src.dev.jslibs),
    concat('vendor.js'),
    uglify(),
    gulp.dest(src.prod.js)
  ],
    cb);
});

// main js task
gulp.task('js', function (event) {
	return gulp.src(
    [
      'node_modules/babel-polyfill/dist/polyfill.js',
      src.dev.js
    ])
		.pipe(babel({
      presets: ['es2015'],
      minified: true
    }))
		.pipe(gulp.dest(src.prod.js))
    .pipe(reload({stream:true}));
});

// prog js task
gulp.task('prog-js', function (event) {
	return gulp.src(src.dev.progjs)
		.pipe(babel({
      presets: ['env'],
      minified: false
    }))
		.pipe(gulp.dest(src.prod.js))
    .pipe(reload({stream:true}));
});

// pug task
gulp.task('pug', function (cb) {
	return gulp.src(src.dev.pug)
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest(src.prod.html))
    .pipe(reload({stream:true}));
  /*pump([
    gulp.src(src.dev.pug),
    pug({pretty: true}),
    gulp.dest(src.prod.html),
    reload({stream:true})
  ],
    cb);*/
});

// stylus task and minify
gulp.task('stylus', function () {
	return gulp.src(src.dev.stylus + 'style.styl')
		.pipe(stylus())
		.pipe(gulp.dest(src.prod.css));
});

gulp.task('css-make', ['stylus'], function () {
	return gulp.src(src.prod.css + '/style.css')
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest(src.prod.css))
    .pipe(reload({stream:true}));
});

gulp.task('css-min', ['css-make'], function () {
	return gulp.src(src.prod.css + '/style.css')
    .pipe(cleanCSS({debug: true}, (details) => {
      console.log(`${details.name}: ${details.stats.originalSize}`);
      console.log(`${details.name}: ${details.stats.minifiedSize}`);
    }))
		.pipe(gulp.dest(src.prod.css));
});

// image minify task
gulp.task('image-min', function () {
  imagemin(src.dev.imgs + '.{jpg,JPG,jpeg,JPEG,gif,png,svg}', src.prod.imgs, {
    compress_force: false,
    statistic: true,
    autoupdate: true
  }, false, {
    jpg: {
      engine: 'jpegtran',
      command: ['-trim', '-progressive', '-copy', 'none', '-optimize']
    }
  }, {
    png: {
      engine: 'pngquant', 
      command: ['--quality=30-60']
    }
  }, {
    svg: {
      engine: 'svgo',
      command: false
    }
  }, {
    gif: {
      engine: 'gifsicle',
      command: ['--colors', '64', '--use-col=web']
    }
  }, function () {});
});

gulp.task('icons-min', function () {
  imagemin(src.dev.icons + '.{jpg,JPG,jpeg,JPEG,gif,png,svg}', src.prod.icons, {
    compress_force: false,
    statistic: true,
    autoupdate: true
  }, false, {
    jpg: {
      engine: 'jpegtran',
      command: ['-trim', '-progressive', '-copy', 'none', '-optimize']
    }
  }, {
    png: {
      engine: 'pngquant', 
      command: ['--quality=30-60']
    }
  }, {
    svg: {
      engine: 'svgo',
      command: false
    }
  }, {
    gif: {
      engine: 'gifsicle',
      command: ['--colors', '64', '--use-col=web']
    }
  }, function () {});
});

// Reload all Browsers
gulp.task('bs-reload', function () {
  browserSync.reload({stream:true});
});

// watch-такс с релоадом
gulp.task('default', ['browser-sync', 'watch'], function () {
  gulp.watch('css/*.css', function (file) {
    if (file.type === "changed") {
      reload(file.path);
    }
  });
  gulp.watch("*.html", ['bs-reload']);
});

// Watch-таск для работы
gulp.task('watch', function () {
	gulp.watch(src.dev.pug, ['pug']);
	gulp.watch(src.dev.imgs, ['image-min']);
	gulp.watch(src.dev.icons, ['icons-min']);
	gulp.watch(src.dev.stylus + '**/*.styl', ['stylus', 'css-make']);
	gulp.watch(src.dev.jsdir + '*/*.js', ['js', 'js-libs', 'prog-js']);
});

// Сборка проекта
gulp.task('build', ['pug', 'stylus', 'css-make', 'css-min', 'js', 'js-libs', 'prog-js', 'image-min', 'icons-min']);
