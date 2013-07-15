
var Resource       = require('deployd/lib/resource'),
    fs             = require('fs'),
    util           = require('util'),
    path           = require('path'),
    coffee         = require('coffee-script'),
    Mincer         = require('mincer'),
    winston        = require('winston');

var mime = {
    '.js':      'application/javascript',
    '.css':     'text/css'
};

var logger = new (winston.Logger)({
    transports: [
        new winston.transports.File({ filename: 'logs.log' })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'errors.log' })
    ]
});


function AssetPipeline(name, options) {
    Resource.apply( this, arguments );

    var paths = [
        'assets/javascripts',
        'assets/stylesheets',
        '../node_modules'
    ];

    if (options && options.config && options.config.paths) {
        paths = options.config.paths.replace(/\n/g, '').replace(/, /g, ',').split(',');
    }

    this.config.paths = paths;
}



module.exports = AssetPipeline;
util.inherits( AssetPipeline, Resource );

AssetPipeline.prototype.getEnv = function() {
    var paths = this.config.paths;
    var environment = new Mincer.Environment();

    for (var index in paths) {
        var path = this.public_path(paths[index]);
        environment.appendPath(path);
    }

    return environment;
};

AssetPipeline.prototype.handle = function ( ctx, next ) {
    if (ctx.req.internal) {
        return this.handleInternal(ctx, next);
    }

    return this.handleExternal(ctx, next);
};

AssetPipeline.prototype.handleInternal = function(ctx, next) {
    return ctx.done(null, '');
};

AssetPipeline.prototype.handleExternal = function(ctx, next) {
    var filename = this.getFile(ctx);
    var ext = this.getExt(ctx);
    var pipeline = this;

    if (!filename || (ctx.req && ctx.req.method !== 'GET')) {
        return next();
    }

    // handle JST for application
    if (ext === '.jst') {
        return this.renderJST(filename, ctx);
    }

    var file = this.public_path(ctx.req.url);
    fs.exists(file, function (exists) {
        if (exists && !mime[ext]) {
            return fs.createReadStream(file).pipe(ctx.res);            
        }

        return pipeline.renderAsset(filename, ctx);
    });   
}

AssetPipeline.prototype.asset = function(filename) {
    var data = "";
    var assets = this.getEnv().findAsset(filename);

    if (typeof assets !== "undefined") {
        data = assets.toString();
    }

    return data;
};

AssetPipeline.prototype.renderAsset = function(filename, ctx) {
    var ext = this.getExt(ctx);
    var data = this.asset(filename);

    ctx.res.setHeader('Content-Type', mime[ext]);
    ctx.res.setHeader('Content-Length', data.length);

    return ctx.res.end(data);
};

AssetPipeline.prototype.renderJST = function(filename, ctx) {
    var ext = this.getExt(ctx);
    var filename = this.name + '/' + path.basename(filename, '.jst');
    this.JST(filename, function(jst) {
        var data = "var JST = " + JSON.stringify(jst);

        ctx.res.setHeader('Content-Type', 'application/javascript');
        ctx.res.setHeader('Content-Length', data.length);

        return ctx.res.end(data);
    });

};

AssetPipeline.prototype.JST = function(relativePath, next) {
    var jst = {};
    var glob = require("glob")
    var pipeline = this;

    if (typeof relativePath === 'undefined' || relativePath === null) { 
        relativePath = 'assets/javascripts/';
    }

    var absolutePath = this.public_path(relativePath);
    var options = { cwd: absolutePath };

    glob("**/*.html", options, function (er, files) {
        pipeline.fetchHtmlFiles(absolutePath, files, function(jst) {
            next(jst);
        });
    });

};

AssetPipeline.prototype.fetchHtmlFiles = function(absolutePath, files, next) {
    var jst = {};
    var count = files.length;

    if (files.length == 0) {
        return next(jst);
    }

    for (var index in files) {
        var absoluteFile = path.normalize(absolutePath + '/' + files[index]);
        var jstKey = files[index].replace('.html', '');

        fs.readFile(absoluteFile, 'utf8', function(err, data) {

            jst[jstKey] = data;

            if (--count <= 0) {
                return next(jst);                
            }
        });
    }

};

AssetPipeline.prototype.public_path = function(filename) {
    if (filename && filename.indexOf('?') != -1) {
        filename = filename.substring(0, filename.indexOf('?'));
    }

    return path.normalize(__dirname + '/../../public/' + filename);
}

AssetPipeline.prototype.getFile = function(ctx) {
    var parts = ctx.req.url.split('/').filter(function(p) { return p; });
    var filename = (parts && parts.length > 0) ? parts[parts.length - 1] : null;

    if (filename && filename.indexOf('?') !== -1) {
        filename = filename.substring(0, filename.indexOf('?'));
    }

    return filename;
}

AssetPipeline.prototype.getExt = function(ctx) {
    var filename = this.getFile(ctx);
    return path.extname(filename);
}

AssetPipeline.defaultPath = '/assets';
AssetPipeline.prototype.clientGeneration = true;
//AssetPipeline.events = ["get"];
AssetPipeline.basicDashboard = {
    settings: [
    {
        name        : 'paths',
        type        : 'textarea',
        description : 'Comma seperated lists of where we should check for assets.'
    }
  ]
};