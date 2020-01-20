const integration   = require("./src/table/integration");
const jsonDirectory = require("./src/reader/JsonDirectory");

function MyVaz(config){
    var started = false;
    var debug   = config.debug;

    return {
        tablesFromDirectory(directory){
            if(!started){
                config.tables = jsonDirectory(directory);
                if(debug) console.log("Tables has imported by directory.");
            }    
            else if(debug) console.log("You can't import tables when MyVaz is started.");
        },
        table(name){
            if(Object.keys(config.tables).includes(name))
                return require("./src/table/table")(config,name);
            else if(debug) console.log("This table name don't exists!");
            return false;
        },

        start(){
            if(!started){
                if(debug) console.log("MyVaz is starting...");
                integration(config);
                started = true;
                if(debug) console.log("MyVaz started!");
            }else if(debug) console.log("MyVaz is already started.");
        },
        stop(){
            if(started){
                started = false;
                console.log("MyVaz Stopped!");
            }else if(debug) console.log("MyVaz is already stopped.");            
        }
    };
}

module.exports = MyVaz;