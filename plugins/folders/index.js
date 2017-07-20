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
   db.run("CREATE TABLE IF NOT EXISTS folders (date DATE, folder TEXT, client TEXT, file TEXT)");
   db.close();
  });

  server.route({
      method: 'POST',
      path:'/folders',
      config: {
        handler: createFolder,
        description: 'Creates a new folder',
        notes: ['Test'],
        tags: ['api', 'folders'],
        validate: {
          payload: {
            folder: Joi.string().required(),
            client: Joi.string().required(),
            file: Joi.string().required()
          }
        }
      }
  });

  server.route({
      method: 'GET',
      path:'/folders',
      config: {
        handler: getFolders,
        description: 'Gets all the folders',
        notes: ['Test'],
        tags: ['api','folders']
      }
  });

  next();
};

const createFolder = function (request, reply) {

    console.log('create folder');

    var folder = {
      date: new Date().toISOString(),
      folder: request.payload.folder,
      client: request.payload.client,
      file: request.payload.file
    };

    const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE);
    db.serialize(function() {
      var stmt = db.prepare("INSERT INTO folders (date, folder, client, file) VALUES (?,?,?,?)");
      stmt.run(folder.date, folder.folder, folder.client, folder.file);
      stmt.finalize();
      db.close();
      return reply(folder);
    });
}

const getFolders = function (request, reply) {

  console.log('get folders');

  const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READONLY);

  db.serialize(function() {
    db.all("SELECT * FROM folders", function(err, rows) {
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
