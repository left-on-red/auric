let fs = require('fs');
let Discord = require('discord.js');
let sharding = require('./config/options.json').sharding;
let token = require('./../bot.json').token;

let child_process = require('child_process');

if (!fs.existsSync('./rethink/data')) { fs.mkdirSync('./rethink/data') }
let dbproc = child_process.spawn('./rethink/rethinkdb.exe', ['--bind', 'all', '--port-offset', '531', '-d', './rethink/data']);
//dbproc.stderr.pipe(process.stderr);
//dbproc.stdout.pipe(process.stdout);

if (sharding) {
    let manager = new Discord.ShardingManager('./src/shard.js', {
        totalShards: 'auto',
        token: token
    });

    manager.spawn(manager.totalShards, 2000);
    manager.on('launch', function(shard) { console.log(`shard ${shard.id+1}/${manager.totalShards} launched`) });
}

else {
    let child_process = require('child_process');
    let child = child_process.spawn('node', ['src/shard.js']);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    //if (process.platform === 'win32') {
    //    var rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
    //    rl.on('SIGINT', function() { process.emit('SIGINT') });
    //}
}