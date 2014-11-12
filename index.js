var fs        = require('fs'),
    path      = require('path'),
    Sequelize = require('sequelize'),
    config    = {
            database: 'myDatabase',
            username: null,
            password: null,
            host: 'localhost',
            port: 3306,
            dialect: 'mysql',
            models: './models',
            logging: false
        };

exports.register = function (plugin, options, next) {
    
    Object.keys(options).forEach(function(k) {
        if (config[k] !== undefined) {
            config[k] = options[k];
        }
    });

    var models = {},
        sequelize = new Sequelize(config.database, config.username, config.password, {
            dialect: config.dialect,
            port: config.port,
            host: config.host,
            logging: config.logging
        });

    sequelize
        .authenticate()
        .complete(function(err) {
            if (!!err) {
                plugin.log(['hapi-sequelize', 'error'], 'Error connecting to database. ' + err);
                return next(err);
            }
            
            if (config.models) {
                config.models = path.resolve(config.models);
                fs.readdirSync(config.models).forEach(function(file) {
                    models[file.substr(0, file.indexOf('.'))] = 
                        sequelize.import(path.join(config.models, file));
                });
                sequelize.sync();
            }
            plugin.expose('sequelize', sequelize);
            plugin.expose('models', models);
            plugin.log(['hapi-sequelize', 'info'], 'Sequelize connection created');

            next();
        });
};

exports.register.attributes = {
    pkg: require('./package.json')
};
