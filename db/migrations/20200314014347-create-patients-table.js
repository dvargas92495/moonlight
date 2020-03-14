"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable("patients", {
    id: { type: "int", primaryKey: true, autoIncrement: true, notNull: true },
    date_of_birth: { type: "datetime", notNull: true }
  });
};

exports.down = function(db) {
  return db.dropTable("patients");
};

exports._meta = {
  version: 1
};
