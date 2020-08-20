async function sleep(ms) { return new Promise(function(resolve, reject) { setInterval(function() { resolve() }, ms) }) }

var child_process = require('child_process');
var child = child_process.spawn('node', ['src/bot.js']);
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stdout);
process.on('SIGINT', function() { console.log('exited!'); process.exit() });