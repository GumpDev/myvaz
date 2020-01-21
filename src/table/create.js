const mysql = require("mysql2");
const fs    = require("fs");

const customTypes = require("./customTypes");

function createTable(config,table){
    var sqlCommand = `CREATE TABLE ${table} (\n`;
    
    var table_value = config.tables[table];
    var columns     = Object.keys(table_value);
    
    columns.forEach(column=>{
        var column_props = table_value[column];
        
        if(typeof(column_props) == "string"){
            if(Object.keys(customTypes).includes(column_props.toLowerCase()))
                column_props = customTypes[column_props.toLowerCase()];
        }else{
            if(Object.keys(customTypes).includes(column_props.type.toLowerCase()))
                column_props = customTypes[column_props.type.toLowerCase()];
        }
        
        if(columns[0] != column) sqlCommand += ",\n";

        var type,default_value,null_props,index,ai,comment;

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

        sqlCommand += `${column}${type}${null_props ? null_props : ''}${default_value ? default_value : ''}${index ? index : ''}${ai ? ai : ''}${comment ? comment : ''}`;
    });
    sqlCommand += ") COMMENT 'created_by_myvaz'";
    const connection = mysql.createConnection(config.connection);
    connection.execute(sqlCommand,
    (err,result,fields)=>{
        if(err) throw err;
        fs.writeFileSync(`cache_myvaz/${table}.json`,Buffer.from(JSON.stringify(table_value)));
    });
    connection.end();
}

module.exports = createTable;