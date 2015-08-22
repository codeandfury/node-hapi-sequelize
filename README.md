# hapi-sequelize

This is a plugin for [HAPI](http://hapijs.com/) v9 to connect to a database using [Sequelize](http://sequelizejs.com/) v3.

## Install

You can add the module to your HAPI project using npm:

    $ npm install hapi-sequelize --save

## Adding the plug-in into your project

In your server init file, add the following code after you have created the `server` object (provided options are plugin defaults):

    server.register({
        register: require('hapi-sequelize'),
        options: {
            associationFile: 'associations.js',
            database: 'myDatabase',
            username: null,
            password: null,
            host: 'localhost',
            port: 3306,
            dialect: 'mysql',
            models: './models',
            logging: false,
            native: false,
            dialectOptions: {}
        }
    }, function(err) {
        if (err) {
            server.log('hapi-sequelize error: ' + err);
            throw err;
        }

        // start the server after the plugins have loaded
        server.start(function() {
            console.log('Server running at:', server.info.uri);
        });
    });

## Usage

Your request object should now be decorated with sequelize properties, containing the sequelize connection and models (if provided)

    function incomingRequest(request, reply) {
        var sequelize = request.server.plugins['hapi-sequelize'].db; // Sequelize Database connection
        var models = request.server.plugins['hapi-sequelize'].models; // Sequelize Models
        // TODO: Add your code
        reply();
    }

Defining your models are done as follows. Models should each be in separate files.

    (function() {
        module.exports = function(sequelize, DataTypes) {
            return sequelize.define('user', {
                id: {
                    primaryKey: true,
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4
                },
                name: {
                    type: DataTypes.STRING,
                }
            });
        };
    })();

Associations between models can be done by creating an associations.js file inside of the models folder. You can still pass Sequelize options to your associations [Documentation](http://sequelizejs.com/docs/latest/associations#one-to-one)

    (function() {
        module.exports = [{
            source: 'user', // Filename of first model
            target: 'address', // Filename of second model
            type: 'oneone', // Available options: ['oneone', 'onemany', 'manymany']
            options: {}
        }];
    })();
