var pool = require('./pool')

var ldap_config = require('./config.json').ldap

var ldap = require('ldapjs'),
    server = ldap.createServer(),
    addrbooks = {}, userinfo = {},
    ldap_port = ldap_config.ldap_port,
    basedn = ldap_config.basedn,
    company = ldap_config.company

// ldap
pool(function (users) {
    for (var i = 0; i < users.length; i++) {
        if (!addrbooks.hasOwnProperty(users[i].username)) {
            addrbooks[users[i].username] = [];
            userinfo["cn=" + users[i].username + ", " + basedn] = {
                abook: addrbooks[users[i].username],
                pwd: users[i].password
            };
        }

        var p = (users[i].name || "").indexOf(" ");
        if (p != -1)
            users[i].firstname = users[i].name.substr(0, p);

        p = (users[i].name || "").lastIndexOf(" ");
        if (p != -1)
            users[i].surname = users[i].name.substr(p + 1);

        addrbooks[users[i].username].push({
            dn: "cn=" + users[i].name + ", " + basedn,
            attributes: {
                objectclass: ["top"],
                cn: users[i].name,
                mail: users[i].email,
                givenname: users[i].firstname,
                sn: users[i].surname,
                ou: company
            }
        });
    }

    server.bind(basedn, function (req, res, next) {
        var username = req.dn.toString(),
            password = req.credentials;

        if (!userinfo.hasOwnProperty(username) ||
            userinfo[username].pwd != password) {
            return next(new ldap.InvalidCredentialsError());
        }

        res.end();
        return next();
    });

    server.search(basedn, function (req, res, next) {
        var binddn = req.connection.ldap.bindDN.toString();

        if (userinfo.hasOwnProperty(binddn)) {
            for (var i = 0; i < userinfo[binddn].abook.length; i++) {
                if (req.filter.matches(userinfo[binddn].abook[i].attributes))
                    res.send(userinfo[binddn].abook[i]);
            }
        }
        res.end();
    });

    server.listen(ldap_port, function () {
        console.log("Addressbook started at %s", server.url);
    });
})

// web admin
var admin_port = require('./config.json').admin_port
if (admin_port && admin_port !== -1) {
    var express = require('express');
    var app = express();
    var mongo_express = require('mongo-express/lib/middleware')
    var mongo_express_config = require('./mongo_express_config')

    app.use('/', mongo_express(mongo_express_config))

    var express_server = app.listen(admin_port, function () {
        var host = express_server.address().address;
        var port = express_server.address().port;

        console.log('web admin at http://%s:%s', host, port);
    });
}