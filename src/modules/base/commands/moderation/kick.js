var Discord = require('discord.js');

// TODO: add a check to make sure it doesn't try to kick anyone that's hierarchically above the bot or allow someone to kick someone that's above them
module.exports = {
    config: {
        permissions: ['DISCORD.KICK_MEMBERS'],
        description: 'kicks whoever you specify',
        hidden: false,
        nsfw: false,
        tags: ['management', 'admin'],
        params: [
            { type: 'mention', required: true, name: 'member' },
            { type: 'string', required: false, name: 'reason' }
        ]
    },

    command: async function(imports, parameters) {
        let embed = new Discord.MessageEmbed();
        embed.setColor(imports.local.guild.colors.accent);
    
        let id = parameters[0];
        let reason = null;
        if (parameters[1] != undefined) { reason = parameters[1] }
    
        if (imports.user.id != id) {
            let member = imports.guild.members.fetch(id);
            
            if (reason) {
                await member.kick(reason);
                embed.setDescription(`**${member.user.tag}** has been kicked for **"${reason}"**`);
            }
            else {
                await member.kick();
                embed.setDescription(`**${member.user.tag}** has been kicked`);
            }
        }
    
        else { embed.setDescription(`you can't kick yourself`) }

        imports.channel.send(embed);
    }
}