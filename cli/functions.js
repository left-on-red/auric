const child_process = require('child_process');
const readline = require('readline');

function prompt(ask) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(function(resolve, reject) {
        rl.question(ask, function(answer) { rl.close(); resolve(answer); })
    });
}

async function exec(cmd, out) {
    return new Promise(function(resolve, reject) {
        let child = child_process.exec(cmd);
        if (out) { child.stdout.pipe(process.stdout); child.stderr.pipe(process.stderr) }
        child.on('close', function() { resolve() });
        child.on('error', function(error) { reject(error) });
    });
}

module.exports = {
    prompt: prompt,
    exec: exec
}