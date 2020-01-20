const mysql = require('mysql2');

function Table(config,name){
    const table     = config.tables[name];
    const columns   = Object.keys(table);
    const primary   = columns[columns.map(c=>{if(table[c].index) return table[c].index.toUpperCase()}).indexOf("PRIMARY KEY")];

    return{
        create(param){
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
        
            const connection = mysql.createConnection(config.connection);
            connection.execute(sqlCommand,
            values,
            (err)=>{
                if(err) throw err;
            });
            connection.end();

            if(keys.includes(primary)){
                const where = (typeof(param[primary]) == "string") ? `${primary} = '${param[primary]}'` : `${primary} = ${param[primary]}`;
                return require("./data")(config,name,where);
            }
            else{
                const where = `${primary} = (SELECT max(${primary}) FROM ${name})`;
                return require("./data")(config,name,where);
            }
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