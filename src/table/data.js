const mysql = require('mysql2');

function Data(config,table,where){
    const table_obj = config.tables[name];
    const columns   = Object.keys(table_obj);

    if(!where) where = "1=1";
    
    return{
        get(callback){
            const sqlCommand = `SELECT * FROM ${table} WHERE ${where}`;

            const connection = mysql.createConnection(config.connection);
            connection.execute(sqlCommand,
            (err,rows)=>{
                if(err) throw err;
                callback(rows);
            });
            connection.end();
        },

        edit(param){
            const keys = Object.keys(param);

            var fields = "";
            var values = [];

            keys.forEach(key=>{
                if(!columns.includes(key)){
                    if(config.debug) console.log(`Column ${key} don't exists in the table ${table}`);
                    return false;
                } 
                if(fields != "") fields += ", ";
                fields += key + " = ?";

                values.push(param[key]);
            });

            var sqlCommand = `UPDATE ${table} SET ${fields} WHERE ${where}`;
        
            const connection = mysql.createConnection(config.connection);
            connection.execute(sqlCommand,
            values,
            (err)=>{
                if(err) throw err;
            });
            connection.end();
        },

        delete(){
            const sqlCommand = `DELETE FROM ${table} WHERE ${where}`;

            const connection = mysql.createConnection(config.connection);
            connection.execute(sqlCommand,
            (err)=>{
                if(err) throw err;
            });
            connection.end();
        }
    }
}

module.exports = Data;