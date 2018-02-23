# ldap-mongo-server
> A simple node.js ldap server

## How to use
1. fork this repository
2. ```git clone https://github.com/<yourname>/ldap-mongo-server.git```
3. ```cd ldap-mongo-server```
4. ```npm install```
5. ```cp config.json.example config.json```
6. edit config.json
7. ```sudo node index.js```

## How to change config.json
To be continue

## How to add another people
Change the user_model in your mongodb

## How to test
```bin/bash
   npm run test
```

## Edit your user in web

change admin_port from -1 to any other port

username: root  
password: <empty>

or you can edit it in mongo_express_config.js
