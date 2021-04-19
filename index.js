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
    options = {};

  addActions(options,args);
  
  var readerPath = options.adobePath;

  if( readerPath ) {
    console.log('"'+readerPath+'"' + ' ' + args.join(' '));
    var process  = child.spawn(readerPath, args, {encoding: 'utf8', detached:true, stdio:'ignore'});
    process.unref()

    if(cb) cb();
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

function addActions(options,args){
  if (options.new) {
    args.unshift("/n");
  }

  var openActions = buildOpenActions(options);

  if(openActions.length > 0){
    args.unshift(openActions);
    args.unshift('/A');
  }
}

function buildOpenActions(options){
  console.log('buildOptions',options)
  
  var optionsString = '';

  var OpenActionsOptionNames = 'zoom,navpanes,page,nameddest,comment,view,viewrect,pagemode,scrollbar,toolbar,statusbar,messages,navpanes,highlight,help,fdf'.split(',');
  var optionActions = buildOptions(OpenActionsOptionNames,options);

  if(optionActions.length>0)
    optionsString += optionActions + '=OpenActions';

  var ExtraOptionNames = 'search'.split(',');
  var extraOptions = buildOptions(ExtraOptionNames,options);

  if(extraOptions.length>0) {
    if(optionsString.length === 0)
      optionsString += '=OpenActions';
    optionsString += '&' + extraOptions;
  }

  return optionsString;
}


function buildOptions(optionsNames,options){
  var optionsString = '';
  for (var i = 0; i < optionsNames.length; i++) {
    var optionName = optionsNames[i];
    
    var value = options[optionName];
    if(value==null)
      continue;

    if(optionsString.length>0)
      optionsString += '&';
    optionsString += optionName + '=' + value.toString();
  }  
  return optionsString;
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
  var hi = name.match(/Reader\s+(\d+\.{0,}\d*).*/);
  if (!hi && name.toLowerCase().includes("reader dc")) {
    hi = "12";
  }

  return parseFloat(hi[1]);
}

function findReaderFolders(cb){
  var programsBasePath = process.env['ProgramFiles(x86)'] || process.env['ProgramFiles'];
  var adobeBasePath = path.join(programsBasePath, 'Adobe');
  console.log(`Adobe Base Path: ${adobeBasePath}`)

  fs.access(adobeBasePath, function(err){
    if(err)
      return cb(err);

    fs.readdir( adobeBasePath, function(err,files){
      if(err)
        return cb(err);
      
      var folders = filterReaderFolders(files);
      for (var i = 0; i < folders.length; i++) {
        folders[i] = path.join(adobeBasePath, folders[i]);

        fs.readdir(folders[i], function(innerError, innerFiles) {
          if (!innerError) {
            var innerFolders = filterReaderFolders(innerFiles);
            for (var j = 0; j < innerFolders.length; j++) {
              folders = folders.concat(path.join(folders[i], innerFolders[j]));
            }
          }
        });
      }

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
  return folderName.toLowerCase().includes("reader");
}

