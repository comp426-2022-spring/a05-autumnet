// Place your server entry point code here

const express = require('express')
const app = express()
const db = require("./src/services/database.js")
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// require morgan
const morgan = require('morgan')
const fs = require('fs')

const args = require("minimist")(process.argv.slice(2))

// Serve static HTML files
app.use(express.static('./public'));
app.use(express.json());

// Define allowed argument name 'port'.
args["port", "help", "debug", "log"]
// Define a const `port` using the argument from the command line. 
// Make this const default to port 3000 if there is no argument given for `--port`.
const port = args.port || process.env.PORT || 5555
// Use the fs module to create an arrow function using `fs.readFile`.
// Use the documentation for the Node.js `fs` module. 
// The function must read a file located at `./www/index.html` and do some stuff with it.
// The stuff that should be inside this function is all below.

const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

const debug = args.debug || false
if (debug == true) {
  app.get('/app/log/access', (req, res) => {
      const stmt = db.prepare("SELECT * FROM accesslog").all();
      res.status(200).json(stmt);
  });
  app.get("/app/error", (req, res) => {
      throw new Error("Error Test Successful.");
  });
}

const log = args.log || true

// logging
if (log == true) {
  const accessLog = fs.createWriteStream('access.log', { flags: 'a' })
  app.use(morgan('combined', { stream: accessLog }))
}

// Middleware
app.use((req, res, next) => {

  let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referer: req.headers["referer"],
      useragent: req.headers["user-agent"],
  };

  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)

  next();
});


const server = app.listen(port,() => {
    console.log('App is running on port %PORT%'.replace('%PORT%',port))
})

app.get('/app/', (req, res) => {
    res.status(200).end('OK')
    res.type('text/plain')
})

app.get('/app/flip/', (req, res) => {
    res.status(200).json({ "flip" : coinFlip()})
})

app.get('/app/flips/:number', (req, res) => {
    var flips = coinFlips(req.params.number)
    res.status(200).json({ "raw" : flips, "summary" : countFlips(flips)})
})

app.get('/app/flip/call/heads', (req, res) => {
    res.status(200).json(flipACoin("heads"))
})

app.get('/app/flip/call/tails', (req, res) => {
    res.status(200).json(flipACoin("tails"))
})

app.use(function(req, res) {
    res.status(404).end("Endpoint does not exist")
    res.type("text/plain")
})

function coinFlip() {
    return Math.random() > 0.5 ? ("heads") : ("tails")
}

function coinFlips(flips) {
    var flipList = new Array();
    if (flips < 1 || typeof flips == 'undefined') {
      flips = 1;
    }
    for (var i = 0; i < flips; i++) {  
      flipList.push(coinFlip());
    }
    return flipList;
}

function countFlips(array) {
    var h = 0;
    var t = 0;
    for (let i  = 0; i < array.length; i++) {
      if (array[i] == 'heads') {
        h++;
      }
      if (array[i] == 'tails') {
        t++;
      }
    }
    return {heads: h, tails: t};
}

function flipACoin(call) {
    let flip = coinFlip()
    let result = '';
    if (flip == call) {
      result = 'win';
    } else {
      result = 'lose';
    }
    return {call: call, flip: flip, result: result}
}