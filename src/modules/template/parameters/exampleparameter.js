// is number and > 0
module.exports = function(input, passthrough) {
    var output = { pass: true, value: null }
    if (isNaN(input) || parseInt(input) <= 0) { output.pass = false }
    else { output.value = parseInt(input) }
    return output;
}