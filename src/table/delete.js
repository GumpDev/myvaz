const mysql         = require("mysql2");
const fs    = require("fs");

function deleteTables(config_connection,table_keys,tables){
    const connection = mysql.createConnection(config_connection);
    tables.forEach(table=>{
        if(!table_keys.includes(table.TABLE_NAME)){
            connection.execute('DROP TABLE '+table.TABLE_NAME,
            (err,result,fields)=>{
                if(err) throw err;
                try{
                    fs.unlinkSync(`cache_myvaz/${table.TABLE_NAME}.json`);
                }catch(e){
                    console.log(e);
                }
            });
        }
    });
    connection.end();
}

module.exports = deleteTables;