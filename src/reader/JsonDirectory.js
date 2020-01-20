const fs = require('fs');

function JsonDirectory(directory){
    var files = fs.readdirSync(directory);
    var json  = [];
    var result = {};

    files.forEach(file=>{
        var ext = file.split(".")[file.split(".").length - 1];
        if(ext == "json")
            result[file.replace(".json","")] = JSON.parse(fs.readFileSync(directory+"/"+file)); 
    });

    return result;
}

module.exports = JsonDirectory;