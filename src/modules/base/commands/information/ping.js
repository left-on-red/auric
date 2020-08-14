var Discord = require('discord.js');

module.exports = {
    config: {
        permissions: [],
        description: 'gets the ping of the bot in milliseconds',
        hidden: false,
        nsfw: false,
        tags: ['management', 'utility'],
        params: []
    },

    command: async function(imports) {
        let embed = new Discord.MessageEmbed();
        embed.setColor(imports.local.guild.colors.accent);
        embed.setDescription('pinging...');
    
        let timestamp1 = Date.now();
        let message = await imports.channel.send(embed);
        let timestamp2 = Date.now();
    
        let newEmbed = new Discord.MessageEmbed();
        newEmbed.setColor(imports.local.guild.colors.accent);
        newEmbed.setDescription(`${timestamp2 - timestamp1}ms`);
        message.edit(newEmbed);
    }
}