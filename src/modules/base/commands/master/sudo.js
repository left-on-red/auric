String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
}

let parseMessage = require('../../parseMessage.js');

module.exports = {
    config: {
        name: 'sudo',
        permissions: ['BOT.MASTER'],
        description: 'runs a command as if you were whoever you specify',
        hidden: false,
        nsfw: false,
        params: [
            { type: 'mention', required: true, name: 'possessionee' },
            { type: 'string', required: true, name: 'command' }
        ]
    },

    command: async function(imports, parameters) {
        var member = await imports.guild.members.fetch(parameters[0]);

        let message = {
            author: member.user,
            member: member,
            channel: imports.channel,
            guild: imports.guild,
            content: imports.local.guild.prefix + parameters[1]
        }

        parseMessage(imports, message);
    }
}