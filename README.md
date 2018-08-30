# pdf2img-extended

A nodejs module for converting pdf into image file. 
Extended from original package pdf2img with new configuration options.

(https://www.npmjs.com/package/pdf2img).

Settings added to original package exporting capabilities: 

- width: width of exported image in px.
- heigth: heigth of exported image in px.
- ignoreAspectRatio: allows forcing image resize to size (width x heigth).
- density: DPIs of exported image. Set to 300 by default.
- compression: compression of image. Set to 100% by default (no compression).

If width is set to 'null', aspect ratio is determined by heigth.
If heigth is set to 'null', aspect ratio is determined by width.
If both values are not null, image is resized to fit a width x heigth rectangle while maintaining aspect ratio.

## Dependencies
- GraphicsMagick

Note: Windows users, please be sure GraphicsMagick and Ghostscript are installed (see https://stackoverflow.com/questions/18733695/cimg-error-gm-exe-is-not-recognized-as-an-internal-or-external-command/45783910#45783910 for details) - then it works fine on Windows.

## Installation
```
  $ [sudo] npm install pdf2img-extended
```

## Usage

```javascript
var fs      = require('fs');
var path    = require('path');
var pdf2img = require('pdf2img');

var input   = __dirname + '/test.pdf';

pdf2img.setOptions({
  type: 'png',                                // png or jpg, default jpg
  width: 1024,
  heigth: 512,
  ignoreAspectRatio: true                     // True or False, default false                                 
  density: 96,                                // Image DPIs, default 300
  compression: 75,                            // Image compression, default 100% (no compression)
  outputdir: __dirname + path.sep + 'output', // output folder, default null (if null given, then it will create folder name same as file name)
  outputname: 'test',                         // output file name, dafault null (if null given, then it will create image name same as input name)
  page: null                                  // convert selected page, default null (if null given, then it will convert all pages)
});

pdf2img.convert(input, function(err, info) {
  if (err) console.log(err)
  else console.log(info);
});
```

It will return array of splitted and converted image files.

```javascript
{ result: 'success',
  message: 
   [ { page: 1,
       name: 'test_1.jpg',
       size: 17.275,
       path: '/output/test_1.jpg' },
     { page: 2,
       name: 'test_2.jpg',
       size: 24.518,
       path: '/output/test_2.jpg' },
     { page: 3,
       name: 'test_3.jpg',
       size: 24.055,
       path: '/output/test_3.jpg' } ] }
```

## Maintainer
[Daniel Solá][0]

## License
MIT

[0]: https://github.com/DanielSola
