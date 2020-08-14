var fs = require('fs');

module.exports = {
    readFile: function(path) {
        return new Promise(function(resolve, reject) {
            fs.readFile(path, 'utf8', function(error, data) {
                if (error) { reject(error) }
                else { resolve(data) }
            });
        });
    },

    readDir: function(path) {
        return new Promise(function(resolve, reject) {
            fs.readdir(path, function(error, files) {
                if (error) { reject(error) }
                else { resolve(files) }
            });
        });
    },

    writeFile: function(path, data) {
        return new Promise(function(resolve, reject) {
            fs.writeFile(path, data, function(error) {
                if (error) { reject(error) }
                else { resolve(true) }
            });
        });
    },

    createDirectory: function(path) {
        return new Promise(function(resolve, reject) {
            fs.mkdir(path, function(error) {
                if (error) { reject(error) }
                else { resolve(true) }
            });
        });
    },

    exists: function(path) {
        return new Promise(function(resolve, reject) {
            fs.exists(path, function(bool) { resolve(bool) });
        });
    },

    isFolder: function(path) {
        return new Promise(function(resolve, reject) {
            fs.lstat(path, function(error, stats) {
                if (error) { reject(error) }
                else { resolve(stats.isDirectory()) }
            });
        });
    }
}

/*
const fs = require("fs");

let path = "/path/to/something";

fs.lstat(path, (err, stats) => {

    if(err)
        return console.log(err); //Handle error

    console.log(`Is file: ${stats.isFile()}`);
    console.log(`Is directory: ${stats.isDirectory()}`);
    console.log(`Is symbolic link: ${stats.isSymbolicLink()}`);
    console.log(`Is FIFO: ${stats.isFIFO()}`);
    console.log(`Is socket: ${stats.isSocket()}`);
    console.log(`Is character device: ${stats.isCharacterDevice()}`);
    console.log(`Is block device: ${stats.isBlockDevice()}`);
});
*/