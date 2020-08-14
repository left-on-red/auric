// is a mention or start of the name/nick of a user
module.exports = function(input, passthrough) {
    var output = { pass: true }
    if (input.startsWith('<@')) {
        var input = input.split('<@')[1].substring(0, input.split('<@')[1].length - 1);
        if (input.startsWith('!')) { input = input.substr(1) }
    }

    else {
        var members = passthrough.guild.members.cache.filter(function(member) { return (member.nickname && member.nickname.toLowerCase().includes(input)) || member.user.username.toLowerCase().includes(input) });
        if (members.array().length > 0) {
            var startsWith = members.filter(function(member) { return (member.nickname && member.nickname.toLowerCase().startsWith(input)) || member.user.username.toLowerCase().startsWith(input) });
            if (startsWith.array().length > 0) { input = startsWith.first().id }
            else if (members.array().length > 0) { input = members.first().id }
        }

        else { output.pass = false }
    }

    if (output.pass) { output.value = input }
    else { output.value = null }

    return output;
}