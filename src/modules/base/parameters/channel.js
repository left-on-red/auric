// is a channel or start of a channel name
module.exports = function(input, passthrough) {
    var output = { pass: true }
    if (input.startsWith('<#')) {
        var input = input.split('<#')[1].substring(0, input.split('<#')[1].length - 1);
        if (input.startsWith('!')) { input = input.substr(1) }
    }

    else {
        var channels = passthrough.guild.channels.cache.filter(function(channel) { return channel.type == 'text' && channel.name.includes(input) });
        var startsWith = channels.filter(function(channel) { return channel.name.startsWith(input) });
        if (startsWith.array().length > 0) { input = startsWith.first().id }
        else if (channels.array().length > 0) { input = channels.first().id }
        output.pass = false;
    }

    if (output.pass) { output.value = input }
    else { output.value = null }

    return output;
}