const mysql = require('mysql2');

function Table(config,name){
    const table     = config.tables[name];
    const columns   = Object.keys(table);
    const primary   = columns[columns.map(c=>{if(table[c].index) return table[c].index.toUpperCase()}).indexOf("PRIMARY KEY")];

    return{
        async create(param){
            const keys = Object.keys(param);

            var fields = "";
            var values = [];
            var val = "";

            keys.forEach(key=>{
                if(!columns.includes(key)){
                    if(config.debug) console.log(`Column ${key} don't exists in the table ${name}`);
                    return false;
                } 
                if(fields != "") fields += ", ";
                fields += key;

                if(val != "") val += ", ";
                val += "?";

                values.push(param[key]);
            });
            
            var sqlCommand = `INSERT INTO ${name}(${fields}) VALUES (${val})`;
        
            return new Promise((resolve,reject)=>{
                var retornValue = null;
    
                if(keys.includes(primary)){
                    const where = (typeof(param[primary]) == "string") ? `${primary} = '${param[primary]}'` : `${primary} = ${param[primary]}`;
                    retornValue = require("./data")(config,name,where).get();
                }
                else{
                    const where = `${primary} = (SELECT max(${primary}) + 1 FROM ${name})`;
                    retornValue = require("./data")(config,name,where).get();
                }

                const connection = mysql.createConnection(config.connection);
                connection.execute(sqlCommand,
                values,
                (err)=>{
                    if(err) reject(err);
                    else    resolve(retornValue);
                });
                connection.end();
            });
            
        },
        find(id){
            const where = (typeof(id) == "string") ? `${primary} = '${id}'` : `${primary} = ${id}`;
            return require("./data")(config,name,where);
        },
        where(w){
            return require("./data")(config,name,w);
        },
        all(){
            return require("./data")(config,name);
        }
    }
}

module.exports = Table;