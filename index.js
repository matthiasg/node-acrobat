var fs = require('fs');
var path = require('path');
var child = require('child_process');

module.exports = {

  open: function(path, options, cb){
    var args = ['/s',path];
    launchAcrobat(args, options, cb);
  },
  print: function(path, options, cb){
    var args = ['/h','/p',path];
    launchAcrobat(args, options, cb);
  },
  printPreview: function(path, options, cb){
    var args = ['/s','/p',path];
    launchAcrobat(args, options, cb);
  },
  findReader: findReader,
  findReaderFolders: findReaderFolders,
  filterReaderFolders: filterReaderFolders,
  findHighestVersion: findHighestVersion
}

function launchAcrobat(args, options, cb){

  if(isFunction(options)){
    cb = options;options = {};
  } 

  if(!options)
    options = {}


  var readerPath = options.path;

  if( readerPath ) {
    child.execFile(readerPath, args, options, cb);
  } else {
    findReader(function(err,readerPath){
      if(err)
        return cb(err);

      console.log('"'+readerPath+'"' + ' ' + args.join(' '));
      console.log(args)

      var process  = child.spawn(readerPath, args, {encoding: 'utf8', detached:true, stdio:'ignore'});
      process.unref()

      if(cb)
        cb();
    })
  }
}

function makeCmdCall(exePath,args){

  var commandPath = "start";
  var commandPrefixOptions = ['/b','"acrobat"','cmd','/c']

  args.splice(0,0,exePath);
  for (var i = commandPrefixOptions.length - 1; i >= 0; i--) {
    args.splice(0,0,commandPrefixOptions[i]);
  };

  return commandPath;
}

function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function findReader(cb){
  findReaderFolders(function(err,folders){
    if(err)
      return cb(err);
    if(folders.length === 0 )
      return cb('no reader found');

    var highestVersion = findHighestVersion(folders);
    
    if( highestVersion ){
      cb(null, path.join(highestVersion, 'Reader', 'AcroRd32.exe'))
    } else {
      console.log("WARN: reader version checking not working")
      cb(null, path.join(folders[0], 'Reader', 'AcroRd32.exe'))
    }
  });
}

function findHighestVersion(folders){
  
  var highest = folders[0];
  var v = getVersion(highest);

  for (var i = 1; i < folders.length; i++) {
    var otherV = getVersion(folders[i])
    if(otherV > v){
      highest = folders[i];
      v = otherV;
    };
  }

  return highest;
}

function getVersion(name){
  var hi =  name.match(/Reader\s+(\d+\.{0,}\d*).*/);

  return parseFloat(hi[1]);
}

function findReaderFolders(cb){
  var programsBasePath = process.env['ProgramFiles(x86)'] || process.env['ProgramFiles'];
  var adobeBasePath = path.join(programsBasePath, 'Adobe');

  fs.exists(adobeBasePath, function(exists){
    if(!exists)
      return cb("No ProgramFiles/ProgramFiles(x86) folder found")


    fs.readdir( adobeBasePath, function(err,files){
      if(err)
        return cb(err);
      
      var folders = filterReaderFolders(files);
      for (var i = 0; i < folders.length; i++) {
        folders[i] = path.join(adobeBasePath, folders[i]);
      };

      cb(null, folders);
    });
  }) 
}

function filterReaderFolders(names){
  var readerFolders = [];
  
  names.forEach(function(folderName){
    if(isReaderFolder(folderName))
      readerFolders.push(folderName);
  });

  return readerFolders;
}

function isReaderFolder(folderName){
  return folderName.toLowerCase().indexOf('reader') === 0;
}

