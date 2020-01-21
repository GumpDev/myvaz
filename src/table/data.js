const mysql = require('mysql2');

function Data(config,table,where){
    const table_obj = config.tables[table];
    const columns   = Object.keys(table_obj);

    if(!where) where = "1=1";
    
    return{
        async get(){
            const sqlCommand = `SELECT * FROM ${table} WHERE ${where}`;
    
            return new Promise((resolve,reject)=>{
                const connection = mysql.createConnection(config.connection);
                connection.execute(sqlCommand,
                (err,rows)=>{
                    if(err) reject(err);
                    else    resolve(rows);
                });
                connection.end();
            });
        },

        async edit(param){
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
        
            return new Promise((resolve,reject)=>{
                const connection = mysql.createConnection(config.connection);
                connection.execute(sqlCommand,
                values,
                (err)=>{
                    if(err) reject(err);
                    else    resolve();
                });
                connection.end();
            });
        },

        async delete(){
            const sqlCommand = `DELETE FROM ${table} WHERE ${where}`;

            return new Promise((resolve,reject)=>{
                const connection = mysql.createConnection(config.connection);
                connection.execute(sqlCommand,
                (err)=>{
                    if(err) reject(err);
                    else    resolve();
                });
                connection.end();
            });
        }
    }
}

module.exports = Data;