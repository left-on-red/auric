module.exports = function(imports) {
    imports.client.on('message', function(message) {
        console.log(message.content);
    });
}