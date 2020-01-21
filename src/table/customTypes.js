const mysql   = require("mysql2");

const numbers = "0123456789";
const letters = "abcdefghijklmnopqrstuvwxyz";

module.exports = {
    id:{
        type: "INT",
        notNull: true,
        ai: true,
        index: "PRIMARY KEY"
    },
    hash: {
        type: "VARCHAR",
        notNull: true,
        index: "PRIMARY KEY",
        size: 64,
        return(config,table,column){
            const size = 64;
            const dictionary = letters + numbers;
            var   hash = "";

            for(var i = 0; i < size; i++){
                var rnd = Math.floor(Math.random() * dictionary.length);
                rnd = rnd < 0 ? 0 : rnd;
                rnd = rnd > dictionary.length ? dictionary.length : rnd;
                hash += dictionary[rnd];
            }

            return new Promise((resolve,reject)=>{
                const connection = mysql.createConnection(config.connection);
                connection.execute(`SELECT ${column} FROM ${table} WHERE ${column} = '${hash}'`,
                (err,rows)=>{
                    if(err) reject(err);
                    else{
                        if(rows.length > 0) resolve(this.return(config,table,column,size));
                        else resolve(hash);
                    }   
                });
                connection.end();
            });
        }
    },
    hashnum: {
        type: "VARCHAR",
        notNull: true,
        index: "PRIMARY KEY",
        size: 8,
        return(config,table,column){
            const size = 8;
            const dictionary = numbers;
            var   hash = "";

            for(var i = 0; i < size; i++){
                var rnd = Math.floor(Math.random() * dictionary.length);
                rnd = rnd < 0 ? 0 : rnd;
                rnd = rnd > dictionary.length ? dictionary.length : rnd;
                hash += dictionary[rnd];
            }

            return new Promise((resolve,reject)=>{
                const connection = mysql.createConnection(config.connection);
                connection.execute(`SELECT ${column} FROM ${table} WHERE ${column} = '${hash}'`,
                (err,rows)=>{
                    if(err) reject(err);
                    else{
                        if(rows.length > 0) resolve(this.return(config,table,column,size));
                        else resolve(hash);
                    }   
                });
                connection.end();
            });
        }
    }
}