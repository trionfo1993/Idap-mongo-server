var mongoose = require('mongoose');
var config = require('./config.json').db

// mongodb url
var url = 'mongodb://' + config.user + ':' + config.password + '@' + config.url + ':' + config.port + '/' + config.database

module.exports = function (callback) {
    mongoose.connect(url, function (err) {
        if (err) {
            console.error('connect error')
            process.exit(1)
        } else {
            console.info('connect success')
            var user_schema = new mongoose.Schema({username: String, name: String, password: String, email: String})
            var user_model = mongoose.model('user_model', user_schema)

            // init admin
            user_model.find(function (err, docs) {
                if (docs.length === 0) {
                    var admin = new user_model({
                        username: 'admin',
                        name: 'admin',
                        password: 'admin',
                        email: 'admin@admin.com'
                    });
                    admin.save(function (err, doc) {
                        if (err) {
                            console.error(err)
                        } else {
                            console.info(doc)
                        }
                    })
                }
            })

            if (typeof callback === 'function') {
                user_model.find(function (err, users) {
                    if (err) {
                        console.error(err)
                        process.exit(1)
                    } else {
                        callback(users)
                    }
                })
            }
        }
    })
}