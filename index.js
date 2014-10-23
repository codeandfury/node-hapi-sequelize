var path      = require('path'),
    Sequelize = require('sequelize');

exports.register = function (plugin, options, next) {
    options.url = options.url || 'mysql://localhost';
    options.port = options.port || 3306;
    options.dialect = options.dialect || 'mysql';

    var sequelize = new Sequelize(options.database, options.username, options.password, {
        dialect: options.dialect,
        port: options.port
    });

    sequelize
        .authenticate()
        .complete(function(err) {
            if (!!err) {
                plugin.log(['hapi-sequelize', 'error'], 'Error connecting to database. ' + err);
                return next(err);
            }
            if (options.models) {
                var models = require(path.resolve(options.models));
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
