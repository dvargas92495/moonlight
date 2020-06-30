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
  return db.createTable("one_time_scripts", {
    version: { type: "string", notNull: true, primaryKey: true },
    name: { type: "string", notNull: true },
  });
};

exports.down = function (db) {
  return db.dropTable("one_time_scripts");
};

exports._meta = {
  version: 1,
};
