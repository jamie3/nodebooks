'use strict';

const Boom = require('boom');
const Joi = require('joi');
const sqlite3 = require('sqlite3').verbose();
const dbFile = 'db.txt';

const wreckOptions = {
    headers: {
        'content-type': 'text/xml'
    },
    rejectUnauthorized: true
};


exports.register = function(server, options, next) {

  const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE);

  db.serialize(function() {
   db.run("CREATE TABLE IF NOT EXISTS client_accounts (date DATE, name TEXT)");
   db.close();
  });

  server.route({
      method: 'POST',
      path:'/clientAccounts',
      config: {
        handler: createClientAccount,
        description: 'Creates a new client account',
        notes: ['Test'],
        tags: ['api', 'client accounts'],
        validate: {
          payload: {
            clientAccount: Joi.string().required(),
          }
        }
      }
  });

  server.route({
      method: 'GET',
      path:'/clientAccounts',
      config: {
        handler: getClientAccounts,
        description: 'Gets all the client accounts',
        notes: ['Test'],
        tags: ['api','client accounts']
      }
  });

  next();
};

const createClientAccount = function (request, reply) {

    console.log('create client accounts');

    var clientAccount = {
      date: new Date().toISOString(),
      name: request.payload.clientAccount,
    };

    const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE);
    db.serialize(function() {
      var stmt = db.prepare("INSERT INTO client_accounts (date, name) VALUES (?,?)");
      stmt.run(clientAccount.date, clientAccount.name, function(err) {
        if (err) {
          return reply(Boom.badImplementation());
        } else {
          return reply(clientAccount);
        }
      });
      stmt.finalize();
      db.close();
    });
}

const getClientAccounts = function (request, reply) {

  console.log('get client accounts');

  const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READONLY);

  db.serialize(function() {
    db.all("SELECT * FROM client_accounts", function(err, rows) {
      console.log(rows);
      if (err) {
        console.error(err);
        reply(Boom.badImplementation());
      } else {
        reply(rows);
      }
      db.close();
    });
  });
}

exports.register.attributes = {
  pkg: require('./package.json')
};
