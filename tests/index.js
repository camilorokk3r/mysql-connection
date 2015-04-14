var should = require('chai').should();
var MySQLConnection = require('../index.js').MySQLConnection;
var config = {};
config['database'] =   {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'decipher10',
  database: 'fittingroom_dev',
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
      host: 'decipherseo.com',
      port: 22,
      username: 'camilo',
      password: 'nuhyy4g1',
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


