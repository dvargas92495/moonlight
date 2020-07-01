"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable("vcita_clients", {
    client_id: { type: "string", notNull: true, primaryKey: true },
    first_name: { type: "string", notNull: true, defaultValue: "" },
    last_name: { type: "string", notNull: true, defaultValue: "" },
    email: { type: "string", notNull: true, defaultValue: "" },
  });
};

exports.down = function (db) {
  return db.dropTable("vcita_clients");
};

exports._meta = {
  version: 1,
};
