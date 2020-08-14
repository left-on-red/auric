let Discord = require('discord.js');
let options = require('./src/config/options.json');
let config = require('./bot.json');

async function sleep(ms) { return new Promise(function(resolve, reject) { setInterval(function() { resolve() }, ms) }) }

if (options.sharded) {
    var manager = new Discord.ShardingManager('./src/shard.js', {
        // totalShards: 'auto',
        totalShards: 3,
        token: config.token
    });

    manager.spawn(manager.totalShards, 2000);
    manager.on('launch', function(shard) {
        console.log(`shard ${shard.id+1}/${manager.totalShards} launched`);
    });
}

else {
    var child_process = require('child_process');
    var child = child_process.spawn('node', ['src/bot.js']);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stdout);
    process.on('SIGINT', function() { console.log('exited!'); process.exit() });
}