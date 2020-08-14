var Discord = require('discord.js');

module.exports = {
    TEMPLATEPERM: {
        // can the user manage the guild (only checks the user, not the bot)
        TEMPLATEMANAGE: async function(permission, passthrough) {
            var toReturn = { userPerms: true, botPerms: true, master: false }
            if (!passthrough.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_GUILD)) { toReturn.userPerms = false }
            return toReturn;
        }
    }
}