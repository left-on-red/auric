// TODO: add joinedAt and createdAt dates
/*function Member(member) {
    this.username = member.user.username;
    if (member.nickname) { this.nickname = member.nickname }
    this.id = member.user.id;
    this.color = member.displayHexColor;
    this.tag = `#${member.user.discriminator}`;
    this.status = member.user.presence.status;
    if (member.user.presence.activities.length > 0) { this.activity = member.user.presence.activities[0].name }
    this.avatar = member.user.avatarURL({ format: 'png' });
}

function Bot(bot) {
    let member = new Member(bot);
    for (let m in member) { this[m] = member[m] }
}

// TODO: add createdAt date and possibly number of members/list of members
function Role(role) {
    this.name = role.name;
    this.id = role.id;
    this.color = role.hexColor;
    this.mentionable = role.mentionable;
}

function Channel(channel) {
    this.name = channel.name;
    this.id = channel.id;
    this.type = channel.type;
    if (channel.parent) { this.category = channel.parent.name }
}

function Guild(guild) {
    this.name = guild.name;
    this.id = guild.id;
    if (guild.description) { this.description = guild.description }
    this.members = guild.memberCount;
    this.textChannels = guild.channels.cache.filter(channel => channel.type == 'text').size;
    this.voiceChannels = guild.channels.cache.filter(channel => channel.type == 'voice').size;
    this.categoryChannels = guild.channels.cache.filter(channel => channel.type == 'category').size;
    if (guild.iconURL({ type: 'png' })) { this.avatar = guild.iconURL({ type: 'png' }) }
}

module.exports = {
    bot: function(imports) { return new Bot(imports.guild.me) },
    member: function(imports) { return new Member(imports.member) },
    channel: function(imports) { return new Channel(imports.channel) },
    guild: function(imports) { return new Guild(imports.guild) },
    config: function(imports) { return imports.local }
}*/

/*{   
    "sets": {
        "bot": {
            "status": "string"
        },

        "guild": {
            "config": {
                "prefix": "string"
            },
            
            "colors": "color",
            "options": "boolean"
        }
    }
} */

function index(obj, is, value) {
    try {
        if (typeof is == 'string') { return index(obj,is.split('.'), value) }
        else if (is.length == 1 && value !== undefined) { return obj[is[0]] = value }
        else if (is.length == 0) { return obj }
        else { return index(obj[is[0]], is.slice(1), value) }
    }

    catch(error) {}
}

module.exports = {
    init: function(imports) {
        imports.gets.data.guild = {};
        function recurGuild(obj, data, path) {
            for (let o in obj) {
                if (typeof obj[o] == 'object') {
                    data[o] = {};
                    recurGuild(obj[o], data[o]);
                }

                else {
                    data[o] = {
                        permissions: [],
                        function(imports, path) {
                            path = path.slice(6);
                            return index(imports.local.guild, path);
                        }
                    }
                }
            }
        }

        recurGuild(imports.config.defaults.guild, imports.gets.data.guild);

        delete imports.gets.data.guild.whitelist;
        delete imports.gets.data.guild.blacklist;
        delete imports.gets.data.guild.members;
    },

    gets: {
        bot: {
            activity: {
                permissions: [],
                function: function(imports) {
                    if (imports.client.user.presence.activities.length > 0) { return imports.client.user.presence.activities[0].name }
                    return null;
                }
            }
        }
    }
}