"use strict";

var fs = require('fs');
var gm = require('gm');
var path = require('path');
var async = require('async');

var options = {
  type: 'jpg',
  imgWidth: null,
  imgHeigth: null,
  density: 300,
  outputdir: null,
  outputname: null,
  page: null,
  compression: 100,
  ignoreAspectRatio: false
};

var Pdf2Img = function() {};

Pdf2Img.prototype.setOptions = function(opts) {
  options.type = opts.type || options.type;
  options.imgWidth = opts.imgWidth || options.imgWidth;
  options.imgHeight = opts.imgHeigth || options.imgHeigth;
  options.density = opts.density || options.density;
  options.outputdir = opts.outputdir || options.outputdir;
  options.outputname = opts.outputname || options.outputname;
  options.page = opts.page || options.page;
  options.compression = opts.compression || options.compression;
  options.ignoreAspectRatio = opts.ignoreAspectRatio || options.ignoreAspectRatio;
};

Pdf2Img.prototype.convert = function(input, callbackreturn) {
  // Make sure it has correct extension
  if (path.extname(path.basename(input)) != '.pdf') {
    return callbackreturn({
      result: 'error',
      message: 'Unsupported file type.'
    });
  }

  // Check if input file exists
  if (!isFileExists(input)) {
    return callbackreturn({
      result: 'error',
      message: 'Input file not found.'
    });
  }

  var stdout = [];
  var output = path.basename(input, path.extname(path.basename(input)));

  // Set output dir
  if (options.outputdir) {
    options.outputdir = options.outputdir + path.sep;
  } else {
    options.outputdir = output + path.sep;
  }

  // Create output dir if it doesn't exists
  if (!isDirExists(options.outputdir)) {
    fs.mkdirSync(options.outputdir);
  }

  // Set output name
  if (options.outputname) {
    options.outputname = options.outputname;
  } else {
    options.outputname = output;
  }

  async.waterfall([
    // Get pages count
        function (callback) {
             gm(input).identify("%p ", function (err, value) {
                var pageCount = String(value).split(' ');

                if (!pageCount.length) {
                    callback({
                        result: 'error',
                        message: 'Invalid page number.'
                    }, null);
                } else {
                    // Convert selected page
                    if (options.page !== null) {
                        if (options.page < pageCount.length) {
                            callback(null, [options.page]);
                        } else {
                            callback({
                                result: 'error',
                                message: 'Invalid page number.'
                            }, null);
                        }
                    } else  {
                        callback(null, pageCount);
                    }
                }

            })

        },


    // Convert pdf file
    function(pages, callback) {
      // Use eachSeries to make sure that conversion has done page by page
      async.eachSeries(pages, function(page, callbackmap) {
        var inputStream = fs.createReadStream(input);
        var outputFile = options.outputdir + options.outputname + '_' + page + '.' + options.type;

        convertPdf2Img(inputStream, outputFile, parseInt(page), function(error, result) {
          if (error) {
            return callbackmap(error);
          }

          stdout.push(result);
          return callbackmap(error, result);
        });
      }, function(e) {
        if (e) callback(e);

        return callback(null, {
          result: 'success',
          message: stdout
        });
      });
    }
  ], callbackreturn);
};

var convertPdf2Img = function(input, output, page, callback) {
  if (input.path) {
    var filepath = input.path;
  } else {
    return callback({
      result: 'error',
      message: 'Invalid input file path.'
    }, null);
  }
  let aspectRatioFlag = '';
  if(options.ignoreAspectRatio){
    aspectRatioFlag = '!'
  }

  var filename = filepath + '[' + (page - 1) + ']';

  gm(input, filename)
    .density(options.density, options.density)
    .resize(options.imgWidth, options.imgHeight, aspectRatioFlag)
    .quality(options.compression)
    .write(output, function(err) {
      if (err) {
        return callback({
          result: 'error',
          message: 'Can not write output file.'
        }, null);
      }

      if (!(fs.statSync(output)['size'] / 1000)) {
        return callback({
          result: 'error',
          message: 'Zero sized output image detected.'
        }, null);
      }

      var results = {
        page: page,
        name: path.basename(output),
        size: fs.statSync(output)['size'] / 1000.0,
        path: output
      };

      return callback(null, results);
    });
};

// Check if directory is exists
var isDirExists = function(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

// Check if file is exists
var isFileExists = function(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

module.exports = new Pdf2Img;
