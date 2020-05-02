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
  return db.createTable("applications", {
    username: {
      type: "string",
      primaryKey: true,
      notNull: true,
    },
    first_name: { type: "string", notNull: true },
    last_name: { type: "string", notNull: true },
    type: {
      type: "smallint",
      notNull: true,
      defaultValue: 0,
    },
    status: {
      type: "smallint",
      notNull: true,
      defaultValue: 0,
    },
  });
};

exports.down = function (db) {
  return db.dropTable("applications");
};

exports._meta = {
  version: 1,
};
