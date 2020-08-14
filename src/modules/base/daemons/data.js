var rethink = require('rethinkdb');
var config;
var connection;
var name = 'bot';
var defaults;

function setToValue(obj, value, path) {
    var i;
    path = path.split('.');
    for (i = 0; i < path.length - 1; i++) { obj = obj[path[i]] }
    obj[path[i]] = value;
}

function clone(obj) {
    var copy;
    if (null == obj || "object" != typeof obj) return obj;
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) { copy[i] = clone(obj[i]) }
        return copy;
    }

    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) { if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]) }
        return copy;
    }
}


// TODO: possibly swap out rethinkdb for something more "known" such as mongodb
module.exports = async function(imports) {
    config = imports.config.data;
    defaults = clone(imports.config.defaults);
    imports.data = {
        start: async function() {
            connection = await rethink.connect({ host: config.host, port: config.port });
            var databases = await rethink.dbList().run(connection);
            if (!databases.includes(name)) { await rethink.dbCreate(name).run(connection) }
            var tables = await rethink.db(name).tableList().run(connection);
            if (!tables.includes('guild')) { await rethink.db(name).tableCreate('guild').run(connection) }
            if (!tables.includes('user')) { await rethink.db(name).tableCreate('user').run(connection) }
            console.ready(`connected to rethink://${config.host}:${config.port}`);
            connection.addListener('close', function() {
                console.error('lost connection...');
                process.emit('SIGINT');
            });
        },

        _get: async function(table, id) {
            var obj = await rethink.db(name).table(table).get(id).run(connection);
            if (obj == null) {
                defaults[table].id = id;
                await rethink.db(name).table(table).get(id).replace(defaults[table]).run(connection);
                obj = await rethink.db(name).table(table).get(id).run(connection);
            }

            return obj;
        },

        _set: async function(table, id, path, value) {
            var obj = await this.get(table, id);
            setToValue(obj, value, path);
            await rethink.db(name).table(table).get(id).replace(obj).run(connection);
        },

        _replace: async function(table, id, obj) {
            obj.id = id;
            await rethink.db(name).table(table).get(id).replace(obj).run(connection);
        },

        guild: {
            get: async function(id) {
                let guild = await imports.data._get('guild', id);
                return guild;
            },

            set: async function(id, path, value) {
                let guild = await this.get(id);
                setToValue(guild, value, path);

                await rethink.db(name).table('guild').get(id).replace(guild).run(connection);
            },

            replace: async function(id, obj) {
                obj.id = id;
                await rethink.db(name).table('guild').get(id).replace(obj).run(connection);
            }
        },

        user: {
            get: async function(id) {
                var user = await imports.data._get('user', id);
                return user;
            },

            set: async function(id, path, value) {
                await imports.data._set('user', id, path, value);
            },

            replace: async function(id, obj) {
                await imports.data._replace('user', id, obj);
            }
        }
    }
}