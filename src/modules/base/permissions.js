var Discord = require('discord.js');

module.exports = {
    // direct integration with the discord.js permission flags
    // checks both the user and the bot for permissions
    DISCORD: async function(permission, passthrough) {
        var toReturn = { userPerms: true, botPerms: true, master: false }
        if (Discord.Permissions.FLAGS[permission]) {
            if (!passthrough.member.hasPermission(Discord.Permissions.FLAGS[permission])) { toReturn.userPerms = false }
            if (!passthrough.guild.me.hasPermission(Discord.Permissions.FLAGS[permission])) { toReturn.botPerms = false }
        }

        return toReturn;
    },

    BOT: {
        // is the user the "bot master"
        MASTER: async function(permission, passthrough) {
            var toReturn = { userPerms: true, botPerms: true, master: false }
            if (passthrough.member.user.id != passthrough.config.main.master) { toReturn.userPerms = false; toReturn.master = true; }
            return toReturn;
        }
    },

    GUILD: {
        // is the user the owner of the guild
        OWNER: async function(permission, passthrough) {
            var toReturn = { userPerms: true, botPerms: true, master: false }
            if (passthrough.member.user.id != passthrough.guild.ownerID) { toReturn.userPerms = false }
            return toReturn;
        },

        // can the user manage the guild (only checks the user, not the bot)
        MANAGE: async function(permission, passthrough) {
            var toReturn = { userPerms: true, botPerms: true, master: false }
            if (!passthrough.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_GUILD)) { toReturn.userPerms = false }
            return toReturn;
        }
    }
}