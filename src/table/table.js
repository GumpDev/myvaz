const mysql = require('mysql2');
const customTypes = require("./customTypes");

function Table(config,name){
    const table     = config.tables[name];
    const columns   = Object.keys(table);
    var   columns_real = {}; 
    columns.forEach(column=>{
        var typeT = table[column].type || table[column];
        if(customTypes[typeT])
            columns_real[column] = customTypes[typeT];
        else 
            columns_real[column] = table[column];
    });

    var primary = null;
    columns.forEach((obj)=>{
        if(typeof(columns_real[obj]) != "string"){
            if(columns_real[obj].index){
                if(columns_real[obj].index.toUpperCase() == "PRIMARY KEY")
                    primary = obj;
            }
        }
    });
    
    return{
        async create(param){
            const keys = Object.keys(param);
            
            var Pkey = null;
            var PNam = null;
            var PVal = null;
            columns.forEach(c=>{
                if(Object.keys(customTypes).includes(table[c].toLowerCase()) || (table[c].type && Object.keys(customTypes).includes(table[c].type.toLowerCase()))){
                    var type = null;
                    if(typeof(table[c]) == "string") type = table[c];
                    else type = table[c].type;
                    
                    if(customTypes[type].return){
                        PNam = c;
                        Pkey = customTypes[type].return;
                    }
                }
            });
            if(Pkey)
                PVal = await Pkey(config,name,PNam);

            var fields = "";
            var values = [];
            var val = "";

            if(PVal){
                fields = PNam;
                val = "?";
                values.push(PVal);
                param[primary] = PVal;
            }

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
                const connection = mysql.createConnection(config.connection);
                connection.execute(sqlCommand,
                values,
                (err)=>{
                    if(err) reject(err);
                    else{
                        if(keys.includes(primary) || PVal){
                            const where = (typeof(param[primary]) == "string") ? `${primary} = '${param[primary]}'` : `${primary} = ${param[primary]}`;
                            resolve(require("./data")(config,name,where).get());
                        }
                        else{
                            const connection2 = mysql.createConnection(config.connection);
                            connection2.execute(`SELECT max(${primary}) as id FROM ${name}`,
                            (err2,rows2)=>{
                                if(err2) reject(err2);
                                else {
                                    const where = `${primary} = ${rows2[0]['id']}`;
                                    resolve(require("./data")(config,name,where).get());
                                }
                            });
                            connection2.end();
                        }
                    }    
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