var path      = require('path'),
    Sequelize = require('sequelize'),
    config    = {
            database: 'myDatabase',
            username: null,
            password: null,
            url: 'mysql://localhost',
            port: 3306,
            dialect: 'mysql',
            models: './models'
        };

exports.register = function (plugin, options, next) {
    
    Object.keys(options).forEach(function(k) {
        if (config[k] !== undefined) {
            config[k] = options[k];
        }
    });

    var sequelize = new Sequelize(config.database, config.username, config.password, {
        dialect: config.dialect,
        port: config.port
    });

    sequelize
        .authenticate()
        .complete(function(err) {
            if (!!err) {
                plugin.log(['hapi-sequelize', 'error'], 'Error connecting to database. ' + err);
                return next(err);
            }
            if (config.models) {
                var models = require(path.resolve(config.models));
                models.sequelize.sync().complete(function(err) {
                    if (!!err) {
                        plugin.log(['hapi-sequelize', 'error'], 'Error syncing models. ' + err);
                        return next(err);
                    }
                    plugin.expose('sequelize', sequelize)
                    plugin.log(['hapi-sequelize', 'info'], 'Sequelize connection created. Models synced');

                    next();
                });
            } else {
                plugin.expose('sequelize', sequelize)
                plugin.log(['hapi-sequelize', 'info'], 'Sequelize connection created');

                next();
            }
        });
};

exports.register.attributes = {
    pkg: require('./package.json')
};
