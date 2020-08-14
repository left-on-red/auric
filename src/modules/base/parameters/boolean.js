// true or false
module.exports = function(input, passthrough) {
    let output = { pass: true }
    if (input.toLowerCase() == 'true') { output.value = true }
    else if (input.toLowerCase() == 'false') { output.value = false }
    else { output.pass = true; output.value = null }
    return output;
}