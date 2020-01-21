# MyVaz
Transforms MySql into Js Commands!

By [GumpFlash](https://www.youtube.com/gumpflash) from [DeltaSquad](https://deltasquad.com.br)


------------------------------


### How To Install


By NPM:
```npm i @gumpflash/myvaz```

By GitHub:
```git clone https://github.com/GumpFlash/myvaz.git```


------------------------------

### How To Use

To start you need make this structure:
```
const MyVaz = require('myvaz');

const myvaz = MyVaz({
    connection:{
        host: 'localhost',
        user: 'root',
        password: 'SECRET (shiiii)',
        database: 'my_table'
    },
    tables:{ /* Go To Table Session */ },  //You can make your tables 
    debug: true //This show messages in console, but it's unecessary
});
```


------------------------------

### Table

To start you need make this structure:
