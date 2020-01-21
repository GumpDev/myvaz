const mysql = require("mysql2");
const fs    = require("fs");

const customTypes = require("./customTypes");

var table_cache = {};

function verifyTable(config,table){
    const connection = mysql.createConnection(config.connection);
    const tables     = config.tables[table];
    const table_keys = Object.keys(tables);
    
    try{
        table_cache[table] = JSON.parse(fs.readFileSync(`cache_myvaz/${table}.json`));
    }catch(e){console.log(e);}

    var   now_columns = null;

    connection.execute(`SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?`,
    [table],
    (err,result,fields)=>{
        if(err) throw err;
        
        now_columns = result;

        result.forEach(column=>{
            if(!table_keys.includes(column.COLUMN_NAME))
                connection.execute(`ALTER TABLE ${table} DROP COLUMN ${column.COLUMN_NAME}`,
                (error)=>{
                    if(error) throw error;
                });
        });
        updateTable(config,now_columns,table);

        connection.end();
    });
}

function updateTable(config,columns,table){
    const tables     = config.tables[table];
    const table_keys = Object.keys(tables);

    table_keys.forEach(column=>{
        var index = columns.map(c=>{return c.COLUMN_NAME}).indexOf(column);
        if(index < 0) createColumn(config,column,table);
        else           alterColumn(config,column,columns[index],table);
    });

}

function alterColumn(config,column,column_now,table){
    var column_props = config.tables[table][column];

    if(typeof(column_props) == "string"){
        if(Object.keys(customTypes).includes(column_props.toLowerCase()))
            column_props = customTypes[column_props.toLowerCase()];
    }else{
        if(Object.keys(customTypes).includes(column_props.type.toLowerCase()))
            column_props = customTypes[column_props.type.toLowerCase()];
    }
    
    var type,default_value,null_props,index,ai,comment;
    var sqlCommand = "";

    if(JSON.stringify(config.tables[table][column]) != JSON.stringify(table_cache[table][column])){
        if(typeof(column_props) == "string")
            type = ' '+column_props;
        else{
            if(column_props.type)       type =          ' '+column_props.type; else type = ' TEXT';
            if(column_props.size)       type +=         `(${column_props.size})`; 
            if(column_props.default){
                if(column_props.default.toUpperCase() == "CURRENT_DATE" || column_props.default.toUpperCase() == "CURRENT_TIME")
                    default_value = ` DEFAULT ${column_props.default}`;
                else
                    default_value = ` DEFAULT '${column_props.default}'`;
            }    
            if(column_props.ai)         ai =            " AUTO_INCREMENT";
            if(column_props.notNull)    null_props =    " NOT NULL";
            if(column_props.comment)    comment =        ` COMMENT '${column_props.comment}'`;
        }

        sqlCommand = `ALTER TABLE ${table} MODIFY ${column}${type}${null_props ? null_props : ''}${default_value ? default_value : ''}${ai ? ai : ''}${comment ? comment : ''}`;
        
        if(column_props.index){
            if((column_now.COLUMN_KEY == "PRI" && column_props.index.toUpperCase() != "PRIMARY KEY") ||
            (column_now.COLUMN_KEY == "UNI" && column_props.index.toUpperCase() != "UNIQUE")      ||
            (column_now.COLUMN_KEY == "")){
                switch(column_props.index.toUpperCase()){
                    case 'PRIMARY KEY':
                        sqlCommand += `;ALTER TABLE ${table} DROP PRIMARY KEY; ALTER TABLE ${table} ADD PRIMARY KEY (${column});`
                    break;
                    case 'UNIQUE':
                        sqlCommand += `;ALTER TABLE ${table} ADD UNIQUE (${column});`
                    break;
                }
            }
        }else if(column_now.COLUMN_KEY != "")
            sqlCommand += `;ALTER TABLE ${table} DROP INDEX ${column};`
        
        const connection = mysql.createConnection(config.connection);
        connection.execute(sqlCommand,
        (error)=>{
            if(error) throw error;
        });
        connection.end();

        fs.writeFileSync(`cache_myvaz/${table}.json`,JSON.stringify(config.tables[table]));
    }
}

function createColumn(config,column,table){
    var column_props = config.tables[table][column];

    if(typeof(column_props) == "string"){
        if(Object.keys(customTypes).includes(column_props.toLowerCase()))
            column_props = customTypes[column_props.toLowerCase()];
    }else{
        if(Object.keys(customTypes).includes(column_props.type.toLowerCase()))
            column_props = customTypes[column_props.type.toLowerCase()];
    }

    var type,default_value,null_props,index,ai,comment;
    var sqlCommand = "";

    if(typeof(column_props) == "string")
        type = ' '+column_props;
    else{
        if(column_props.type)       type =          ' '+column_props.type; else type = ' TEXT';
        if(column_props.size)       type +=         ` (${column_props.size})`;
        if(column_props.default){
            if(column_props.default.toUpperCase() == "CURRENT_DATE" || column_props.default.toUpperCase() == "CURRENT_TIME")
                default_value = ` DEFAULT ${column_props.default}`;
            else
                default_value = ` DEFAULT '${column_props.default}'`;
        }    
        if(column_props.notNull)    null_props =    " NOT NULL";
        if(column_props.index)      index =         ` ${column_props.index}`;
        if(column_props.ai)         ai =            " AUTO_INCREMENT"
        if(column_props.comment)    comment =        ` COMMENT '${column_props.comment}'`;
    }

    sqlCommand = `ALTER TABLE ${table} ADD COLUMN ${column}${type}${null_props ? null_props : ''}${default_value ? default_value : ''}${index ? index : ''}${ai ? ai : ''}${comment ? comment : ''}`;
    const connection = mysql.createConnection(config.connection);
    connection.execute(sqlCommand,
    (error)=>{
        if(error) throw error;
    });
    connection.end();
    
    if(config.tables[table][column] != table_cache[table][column])
        fs.writeFileSync(`cache_myvaz/${table}.json`,JSON.stringify(config.tables[table]));
}

module.exports = verifyTable;