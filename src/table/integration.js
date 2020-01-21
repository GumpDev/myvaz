const mysql         = require("mysql2");
const fs            = require("fs");
const fswin         = require("fswin");

const createTable   = require("./create");
const deleteTables  = require("./delete");
const verifyTable   = require("./verify");

function Integration(config){
    if(!fs.existsSync("cache_myvaz/")){
        fs.mkdirSync("cache_myvaz/");
        try{
            fswin.setAttributesSync('cache_myvaz/', { IS_HIDDEN: true });
        }catch(e){}
    }

    const connection = mysql.createConnection(config.connection);
    const tables     = config.tables;
    const table_keys = Object.keys(tables);

    connection.execute('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_COMMENT = ? AND TABLE_SCHEMA = ?',
    ['created_by_myvaz',config.connection.database],
    (err,result,fields)=>{
        if(err) throw err;
        deleteTables(config.connection,table_keys,result);
    });

    table_keys.forEach(table_name=>{
        const table = tables[table_name];
        connection.execute('SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?',
        [table_name,config.connection.database],
        (err,result,fields)=>{
            if(err) throw err;

            if(result.length > 0) verifyTable(config,table_name);
            else createTable(config,table_name);
        });
    });

    connection.end();
}

module.exports = Integration;