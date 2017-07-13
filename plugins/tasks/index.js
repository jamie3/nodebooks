'use strict';

const Boom = require('boom');
const Joi = require('joi');
const sqlite3 = require('sqlite3').verbose();
const dbFile = 'db.txt'

const wreckOptions = {
    headers: {
        'content-type': 'text/xml'
    },
    rejectUnauthorized: true
};


exports.register = function(server, options, next) {

  const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE);

  db.serialize(function() {
    //db.run("DROP TABLE records");
   db.run("CREATE TABLE IF NOT EXISTS records (date DATE, folder TEXT, client TEXT, file TEXT, account TEXT, category TEXT, notes TEXT, hours NUMERIC, rate NUMERIC)");
   db.close();
  });

  server.route({
      method: 'POST',
      path:'/records',
      config: {
        handler: createRecord,
        description: 'Creates a new record',
        notes: ['Test'],
        tags: ['api'],
        validate: {
          payload: {
            date: Joi.string().required(),//regex(/^[0-9]{4}[0-9]{2}[0-9]{2}$/).required(),
            folder: Joi.string().required(),
            client: Joi.string().required(),
            file: Joi.string().optional(),
            account: Joi.string().optional(),
            category: Joi.string().required(),
            notes: Joi.string().optional(),
            hours: Joi.number().min(0).required(),
            rate: Joi.number().min(0).required()
          }
        }
      }
  });

  server.route({
      method: 'GET',
      path:'/records',
      config: {
        handler: getRecords,
        description: 'Gets all the records',
        notes: ['Test'],
        tags: ['api']
        //,
        /*validate: {
          payload: {
            folder: Joi.string().required().description('folder required')
          }
        }*/
      }
  });

  next();
};

const createRecord = function (request, reply) {

  console.log('create record');

  var record = {
    date: request.payload.date,
    folder: request.payload.folder,
    client: request.payload.client,
    file: request.payload.file,
    account: request.payload.account,
    category: request.payload.category,
    notes: request.payload.notes,
    hours: request.payload.hours,
    rate: request.payload.rate
  };

  const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE);
  db.serialize(function() {
    var stmt = db.prepare("INSERT INTO records (date, folder, client, file, account, category, notes, hours, rate) VALUES (?,?,?,?,?,?,?,?,?)");
    stmt.run(record.date, record.folder, record.client, record.file, record.account, record.category, record.notes, record.hours, record.rate);
    stmt.finalize();
    db.close();
    return reply(record);
  });
}

const getRecords = function (request, reply) {

  console.log('get records');

  const db = new sqlite3.Database(dbFile, sqlite3.OPEN_READONLY);

  db.serialize(function() {
    db.all("SELECT * FROM records", function(err, rows) {
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
