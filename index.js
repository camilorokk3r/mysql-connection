var mysql = require('mysql');
var Tunnel = require('tunnel-ssh');
var q = require('q');

module.exports = { 

  MySQLConnection: function (serverConfig, tunnelConfig){

    this.tunnelPort = 3306;          // can really be any free port used for tunneling

    /**
     * DB server configuration. Please note that due to the tunneling the server host
     * is localhost and the server port is the tunneling port. It is because the tunneling
     * creates a local port on localhost
     */
    this.dbServer =  serverConfig;

    /**
     * Default configuration for the SSH tunnel
     */
    this.tunnelConfig = tunnelConfig;

    this.connection = null;

    /**
     * Initialise the mysql connection via the tunnel. Once it is created call back the caller
     *
     */
    this.init = function () {
        //
        // SSH tunnel creation
        //
        var defer = q.defer();

        var me = this;
        //console.log(me);

        me.tunnel = new Tunnel(this.tunnelConfig);
        me.tunnel.connect(function (error) {
            
            if(error){
                defer.reject(error);
            }else{
              console.log('Tunnel connected');  

              me.connect().then(function(connection){
                defer.resolve(connection);
              }, 
              function(connectionError){
                console.log("connectionError:", connectionError);
                defer.reject(connectionError);
              });
            }

        });

        return defer.promise;
    };

    /**
     * Mysql connection error handling
     *
     * @param err
     */
    this.errorHandler = function (err) {

        var me = this;
        console.log("Got Error:", err);
        //
        // Check for lost connection and try to reconnect
        //
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('MySQL connection lost. Reconnecting.');
            me.connection = me.connect();
        } else if (err.code === 'ECONNREFUSED') {
            //
            // If connection refused then keep trying to reconnect every 3 seconds
            //
            console.log('MySQL connection refused. Trying soon again. ' + err);
            setTimeout(function () {
                me.connect();
            }, 3000);
        }
    };

    /**
     * Connect to the mysql server with retry in every 3 seconds if connection fails by any reason
     *
     * @param callback
     * @returns {*} created mysql connection
     */
    this.connect = function () {
        
        var defer = q.defer();
        var me = this;

        // Create the mysql connection object

        var connection = mysql.createConnection(me.dbServer);
        
        connection.on('error', me.errorHandler);
        //
        // Try connecting
        //
        connection.connect(function (err) {
            console.log("Connected!");
            if (err){
              defer.reject(err);
            }else{
              me.connection = connection;

              defer.resolve(connection);
            }
        });
        
        

        return defer.promise;
    }
  }
};