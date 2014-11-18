var fs        = require('fs'),
    path      = require('path'),
    Sequelize = require('sequelize'),
    config    = {
            associationFile: null,
            database: 'myDatabase',
            username: null,
            password: null,
            host: 'localhost',
            port: 3306,
            dialect: 'mysql',
            models: './models',
            logging: false,
            native: false,
            force: false
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
            logging: config.logging,
            native: config.native
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
                    if (file !== config.associationFile) {
                        models[file.substr(0, file.indexOf('.'))] = 
                            sequelize.import(path.join(config.models, file));
                    }
                });

                if (config.associationFile && fs.existsSync(path.join(config.models, config.associationFile))) {
                    var associations = require(path.join(config.models, config.associationFile)),
                        assoc = null;

                    for (var i = 0, length = associations.length; i < length; i ++) {
                        assoc = associations[i];
                        if (models[assoc.source] && models[assoc.target]) {
                            assoc.options = assoc.options || {};
                            if (assoc.options.through && assoc.options.through.model) {
                                assoc.options.through.model = models[assoc.options.through.model];
                            }

                            switch (assoc.type) {
                                case 'oneone':
                                    models[assoc.source].hasOne(models[assoc.target], assoc.options);
                                    models[assoc.target].belongsTo(models[assoc.source], assoc.options);
                                    break;
                                case 'onemany':
                                    models[assoc.source].hasMany(models[assoc.target], assoc.options);
                                    models[assoc.target].belongsTo(models[assoc.source], assoc.options);
                                    break;
                                case 'manymany':
                                    models[assoc.source].hasMany(models[assoc.target], assoc.options);
                                    models[assoc.target].hasMany(models[assoc.source], assoc.options);
                                    break;
                            }
                        }
                    }
                }
                sequelize.sync({ force: config.force }).done(function() {
                    plugin.expose('db', sequelize);
                    plugin.expose('models', models);
                    plugin.log(['hapi-sequelize', 'info'], 'Sequelize connection created');

                    next();
                });
            } else {
                plugin.expose('db', sequelize);
                plugin.expose('models', models);
                plugin.log(['hapi-sequelize', 'info'], 'Sequelize connection created');

                next();
            }
        });
};

exports.register.attributes = {
    pkg: require('./package.json')
};
