node-acrobat
============

A simple wrapper around acrobat reader commands. Can launch a pdf with some parameters (e.g. print/zoom)

I needed this in order to print/show the output from the awesome http://jspdf.com/ library.

**NOTE: Right now its limited to windows, but it should be extensible to any platform. PR welcome**

    acrobat = require('acrobat')
    
    // open reader with a file
    acrobat.open('file.pdf')

    // open the pdf directly in print preview
    acrobat.printPreview('file.pdf')

    // print the pdf to the defined printer
    acrobat.print('file.pdf');
    acrobat.print('file.pdf', "<printername>", "<drivername>", "<portname>");


    // callbacks are possible
    acrobat.printPreview('file.pdf', function(err){
        if(err){
          return console.log("error opening file:", err);
        }

        console.log("opened file");
      })

**Note**: Options not implemented yet

The commands **open** and **printPreview** have extra options:

    acrobat.open('file.pdf', {
        page:2,
        pagemode:'none',
        search:'batch'
      });

The options **new**, **noSplash**, **hidden** are converted to the respective command line parameters /n,/s and /h, /t
   

All other options are added to the command line /A switch, as described http://www.robvanderwoude.com/commandlineswitches.php#Acrobat and http://stackoverflow.com/questions/619158/adobe-reader-command-line-reference.



Which Exe ?
-----------

Finding the right exe is actually the most difficult part of it. On windows it looks through Program Files folder automatically (see below) but it can be overwritten using the option 'adobePath' as in:

     acrobat.open('file.pdf', {adobePath:'<full path to executable>'});

### Automatic search

On windows it first looks in the ProgramFiles(x86)\Adobe folder (as set in process.env) then in ProgramFiles\Adobe.

Underneath that it looks for the highest installed version of "Reader x" it can find.

