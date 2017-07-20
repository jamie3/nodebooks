'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
const Wreck = require('wreck');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Readable = require('stream').Readable;
const Pack = require('./package');

const username = process.env.SABRE_USERNAME;
const password = process.env.SABRE_PASSWORD;
const sabreUrl = process.env.SABRE_URL;
const port = process.env.PORT || 9000;

const server = new Hapi.Server();

server.connection({
    host: 'localhost',
    port: port
});

const options = {
  info: {
    'title': 'Node Books',
    'version': Pack.version,
  }
};

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply.file('html/timeTracking.html')
  }
});

server.route({
  method: 'GET',
  path: '/folders.html',
  handler: function (request, reply) {
    reply.file('html/folders.html')
  }
});

server.route({
  method: 'GET',
  path: '/clientAccounts.html',
  handler: function (request, reply) {
    reply.file('html/clientAccounts.html')
  }
});

server.register([
  Inert,
  Vision,
  {
    'register': HapiSwagger,
    'options': options
}, {
    register: require('./plugins/records/index.js'),
    options: {}
}, {
    register: require('./plugins/folders/index.js'),
    options: {}
}, {
    register: require('./plugins/clientAccounts/index.js'),
    options: {}
}], (err) => {

    if (err) {
        throw err;m
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
