'use strict';

var express = require('express'),
    http = require('http'),
    app = express(),
    bodyParser = require("body-parser"),
    sys = require('sys'),
    fs = require('fs'),
    path = require('path'),
    bytes = require('bytes'),
    multer = require("multer"),
    parseFile = function (file, req) {
        var parsedFile = path.parse(file),
            fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';

        return {
            name: parsedFile.name,
            base: parsedFile.base,
            extension: parsedFile.ext.substring(1),
            url: fullUrl + parsedFile.base,
            size: bytes(fs.statSync(file).size)
        };
    };
var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        console.log(__dirname);
        var pathDes = path.resolve(__dirname, "./public");
        if (!fs.existsSync(pathDes)) {
            fs.mkdirSync(pathDes)
            if (!fs.existsSync(pathDes + "/uploads/")) {
                fs.mkdirSync(pathDes + "/uploads/")
            }
        } else {
            if (!fs.existsSync(pathDes + "/uploads/")) {
                fs.mkdirSync(pathDes + "/uploads/")
            }
        }
        cb(null, pathDes + '/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

var upload = multer({ storage: storage });

app.set('port', process.env.PORT || 1526);
app.use(express.static(path.resolve(__dirname, '/node_modules')));
app.use(express.static(path.resolve(__dirname + '/public')));

app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Last-Event-ID,Cache-Control,X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.post('/uploadFiles', upload.array('file', 12), function (req, res) {
    var uploadedFileNames = [],
        uploadedFiles;

    if (req.files) {
        uploadedFiles = Array.isArray(req.files) ? req.files : [req.files];

        uploadedFiles.forEach(function (value) {
            uploadedFileNames.push(parseFile(value.path, req));
        });

        res.type('application/json');
        res.send(JSON.parse(JSON.stringify({ "uploadedFileNames": uploadedFileNames })));

    }
});

app.get('/files', function (req, res) {
    var dirPath = path.normalize('./public/uploads/');

    fs.readdir(dirPath, function (err, files) {
        if (err) {
            throw err;
            res.send(500, {})
        }

        var uploadedFiles = files.filter(function (file) {
            return file !== '.gitignore';
        }).map(function (file) {
            return path.join(dirPath, file);
        }).filter(function (file) {
            return fs.statSync(file).isFile();
        }).map(function (file) {
            return parseFile(file, req);
        });

        res.type('application/json');
        res.send(uploadedFiles);
    });

});

http.createServer(app).listen(app.get('port'), function () {
    console.log("\n\nNode version: " + process.versions.node);
    console.log("Express server listening on port " + app.get('port') + "\n\n");
});
