var parseMessage = require('./../parseMessage.js');

module.exports = function(imports) {
    imports.client.on('message', function(message) {
        try { parseMessage(imports, message) }
        catch(error) { console.error(error) }
    });
}