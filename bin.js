var couchapp = require('./main.js')
  , watch = require('watch')
  , path = require('path')
  , fs = require('fs')
  ;

function abspath (pathname) {
  return path.join(process.env.PWD, path.normalize(pathname));
}

var node = process.argv.shift()
  , bin = process.argv.shift()
  , command = process.argv.shift()
  , app = process.argv.shift()
  , couch = process.argv.shift()
  ;

if (command == 'help' || command == undefined) {
  console.log(
    [ "couchapp -- utility for creating couchapps" 
    , ""
    , "Usage:"
    , "  couchapp <command> app.js http://localhost:5984/dbname"
    , ""
    , "Commands:"
    , "  push   : Push app once to server."
    , "  sync   : Push app then watch local files for changes."
    , "  boiler : Create a boiler project."
    ]
    .join('\n')
  )
  process.exit();
}

function copytree (source, dest) {
  watch.walk(source, function (err, files) {
    for (i in files) {
      (function (i) {
        if (files[i].isDirectory()) fs.mkdirSync(i.replace(source, dest), 0755)
        else {
          fs.readFile(i, function (err, data) {
            if (err) throw err;
            fs.writeFile(i.replace(source, dest), data, function (err) {
              if (err) throw err;
            });
          })
        } 
      })(i); 
    }
  })
}

if (command == 'boiler') {
  if (app) fs.mkdirSync(path.join(process.env.PWD, app))
  app = app || '.'
  
  copytree(path.join(__dirname, 'boiler'), path.join(process.env.PWD, app))
  
  // fs.writeFileSync(
  //   path.join(process.env.PWD, app, 'app.js'), 
  //   fs.readFileSync(path.join(__dirname, 'sample-app.js')).toString()
  // )
  // 
  // fs.mkdirSync(path.join(process.env.PWD, app, 'attachments'))
  // fs.writeFileSync(
  //   path.join(process.env.PWD, app, 'attachments', 'index.html'), 
  //   fs.readFileSync(path.join(__dirname, 'sample-index.html')).toString()
  // )
  
} else {
  couchapp.createApp(require(abspath(app)), couch, function (app) {
    if (command == 'push') app.push()
    else if (command == 'sync') app.sync()
  
  })
}


