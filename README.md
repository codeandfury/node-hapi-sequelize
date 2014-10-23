# hapi-sequelize

This is a plugin for [HAPI](http://hapijs.com/) v6 or 7 to connect to a database using [Sequelize](http://sequelizejs.com/). 

## Install

You can add the module to your HAPI project using npm:

    $ npm install hapi-sequelize --save

## Adding the plug-in into your project

In your server init file, add the following code after you have created the `server` object (provided options are plugin defaults):

    server.pack.register({
        plugin: require('hapi-sequelize'),
        options: {
            database: 'myDatabase',
            username: null,
            password: null,
            url: 'mysql://localhost',
            port: 3306,
            dialect: 'mysql',
            models: './models'
        }
    }, function(err) {
        if (err) {
            server.log('hapi-sequelize error: ' + err);
        }
    });

## Usage

Your request object should now be decorated with the sequelize property. It will contain the sequelize connection, and models (if provided)

    function incomingRequest(request, reply) {
        var sequelize = request.server.plugins['hapi-sequelize'].sequelize;
        // TODO: Add your code
        reply();
    }