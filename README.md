mysql-connection
=========

A small class to provide mysql database connectivity using ssh tunnels

## Installation

  npm install git://github.com/camilorokk3r/mysql-connection --save

## Usage
```
  var config = {};
  config['database'] =   {
    host: '127.0.0.1',
    port: 3306,
    user: '<database user>',
    password: '<database password>',
    database: '<database>',
    insecureAuth: true, 
    //debug:true
  };

  config['tunnel'] =   {
    remoteHost: '127.0.0.1', // mysql server host
    remotePort: 3306, // mysql server port
    localPort: 3306, // a available local port
    verbose: true, // dump information to stdout
    disabled: false, //set this to true to disable tunnel (useful to keep architecture for local connections)
    sshConfig: { //ssh2 configuration (https://github.com/mscdex/ssh2)
        host: '<host>',
        port: 22,
        username: '<username on host>',
        password: '<password on host>',
        insecureAuth: true
        //privateKey: require('fs').readFileSync('<pathToKeyFile>'),
    }     //passphrase: 'verySecretString' // option see ssh2 config
  };

  var mysqlConnection = new MySQLConnection(config['database'], config['tunnel']);

  mysqlConnection.init().then(function(connection){
    
    console.log("Established a MySQL connection:", connection.threadId);
    connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
      if (err) throw err;

      console.log('The solution is: ', rows[0].solution);

      connection.end(function(){
        connection.destroy();

      });
      process.exit();
      
    });


    
  }, 
  function(err){
    
    console.log("Error:", err);
  });
```