var gulp = require('gulp');
var merge = require('merge-stream');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var $ = require('gulp-load-plugins')({
    lazy: true,
    pattern: [
        'gulp-*', 'gulp.*',
        'main-bower-files',
        'uglify-save-license',
        'del',
        'merge-stream',
        'run-sequence'
    ]
});

var isVerbose = true;
var isProduction = false;

var config = {
    libpath: './node_modules',
    jspath: './wwwroot/js',
    csspath: './wwwroot/css',
    lesspath: './client/app/less',
    fontpath: './wwwroot/fonts',
    tmppath: './client/app/tmp',
    prjpath: './client/app',
    prjtsfiles: './client/app/**/*.ts',
    tsDefs: [
        './typings/**/*.ts',
        './client/app/**/*.ts'        
    ],
    jsLoadOrder:[
        '**/app.module.js',
        '**/*.module.js',
        '**/*.factory.js',
        '**/*.service.js',
        '**/*.controller.js',
        '**/*.directive.js',
        '**/*.config.js',
        '**/*.template.js',
        '**/*.js'
    ]
}

gulp.task('clean', function() {
    return clean([
        config.csspath + '/*.css',
        config.jspath + '/*.js',
        config.prjpath + '/**/*.map',
        config.prjpath + '/**/*.js'
    ]);
});

gulp.task('build-css', function() {
    return gulp.src([
            './node_modules/bootstrap/dist/css/bootstrap.css',
            './node_modules/bootstrap/dist/css/bootstrap-theme.css'
        ])
        .pipe($.concat('app.css'))
        .pipe(gulp.dest(config.csspath))
        .pipe($.cleanCss({ debug: true }, function(details) {
            log('Minify CSS:' + details.name + ': '
                + $.util.colors.green(details.stats.originalSize) + ' --> '
                + $.util.colors.green(details.stats.minifiedSize));
        }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.csspath));
});

gulp.task('build-templates',function(){
    var template =  ngTemplate('');    
});

gulp.task('copy-js-lib',function(){
    return gulp.src([
            config.libpath + '/jquery/dist/jquery.min.js',
            config.libpath + '/bootstrap/dist/js/bootstrap.min.js',
            config.libpath + '/angular/angular.min.js',
            config.libpath + '/angular-ui-router/release/angular-ui-router.min.js',
           ])
           .pipe($.concat('app.lib.js'))
           .pipe(gulp.dest(config.jspath));
});

gulp.task('build-js', function() {
    var stream =         
        gulp.src(config.tsDefs)
        .pipe($.typescript($.typescript.createProject('tsconfig.json')))
        .pipe($.ngAnnotate({add:true, single_quotes: true}))
        .pipe($.order(config.jsLoadOrder))
        .pipe(verbosePrintFiles('build-js'));
    return scriptProcessing(stream,'app.js');
});

gulp.task('watch',function(){
    $.watch([
         config.prjpath + '/**/*.html',
            config.prjpath + '/**/*.htm'],
        $.batch(function(events,done){
            gulp.start('build-templates',done);
    }));
    
    $.watch(config.prjtsfiles,
        $.batch(function(events,done){
            gulp.start('build-js',done);
    }));    
});

function scriptProcessing(stream, bundleFile) {
    return stream
        .pipe($.if(isProduction, $.sourcemaps.init()))
        .pipe($.concat(bundleFile))
        .pipe($.if(isProduction, $.uglify({ preserveComments: $.uglifySaveLicense })))
            .on('error', errorHandler('uglify'))
        .pipe($.if(isProduction, $.sourcemaps.write('maps')))
        .pipe(gulp.dest(config.jspath));
}

function clean(path) {
    if (Array.isArray(path)) {
        log('Cleaning:\r\n\t ->' + path.join('\r\n\t ->'));
    } else {
        log('Cleaning: ' + path);
    }
    return gulp.src(path)
                .pipe($.count('## Ficheiros Eliminados'))
                .pipe($.clean());
}

function log(msg) {
    if (typeof (msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.white(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.white(msg));
    }
}


function ngTemplate(module) {
    return gulp.src([
            config.prjpath + '/**/*.html',
            config.prjpath + '/**/*.htm',
    ])
    .pipe($.htmlmin({ collapseWhitespace: true }))
    .pipe($.angularTemplatecache({
        templateHeader: 'namespace app {\r\n\t// @ngAnnotate\r\n\tfunction Template($templateCache: ng.ITemplateCacheService):void {\t\t\r\n',
        templateBody: '\t\t\t$templateCache.put(\'<%= url %>\',\'<%= contents %>\');',
        templateFooter: '\r\n\t}\r\n\tangular.module(\'app\').run(Template);\r\n}',
        transformUrl: function (url) {
            var n = url.replace(url.substring(0, url.lastIndexOf('\\') + 1), '')
                .replace('.html', '')
                .replace('.htm', '');
            log(url + ' --> ' + n);
            return n;
        }
    }))
    .pipe($.rename({
        basename: 'app.template',
        extname: '.ts'
    }))
    .pipe(gulp.dest(config.prjpath));
}

function verbosePrintFiles(taskName) {
    return $.if(isVerbose, $.print(function(filepath) {
        return '[' + taskName + '] ' + filepath;
    }));
}

function errorHandler(taskName, options) {
    options = options || {};
    return function(err) {
        $.util.log($.util.colors.red('[' + taskName + ']'), err.toString());
        if (options.exit) {
            process.exit(1);
        } else {
            this.emit('end');
        }
    };
}