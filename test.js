var assert = require('assert');
var acrobat = require('./index.js');
var child = require('child_process');
var path = require('path');

var r = acrobat.filterReaderFolders(['Readerx', 'Adobe', 'Photoshop', 'Reader 11.0', 'Reader 9']);
assert(r.length === 3);

acrobat.findReaderFolders(function(err,folders){
  assert(err===null);
  assert(folders.length>0);
  console.log(folders[0]);
});

var highest = acrobat.findHighestVersion(['Reader 11.0', 'Reader 11.1', 'Reader 9'])
assert(highest == 'Reader 11.1');
highest = acrobat.findHighestVersion(['Reader 11.0', 'Reader 11.1', 'Reader 12'])
assert(highest == 'Reader 12');

acrobat.findReader(function(err,path){
  assert(err===null);
  assert(path.indexOf('AcroRd32.exe') > 0);
  console.log(path)
  child.execFile(path);
});

var file = path.join(__dirname, 'test', 'test.pdf' );
//acrobat.open( file );
acrobat.printPreview( file, function(err){
  console.log('done')
});
