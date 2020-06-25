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
  return db.createTable("offices", {
    id: { type: "int", primaryKey: true, notNull: true, autoIncrement: true },
    name: { type: "string", notNull: true },
    address: { type: "string", notNull: true, defaultValue: "" },
    tax_id: {
      type: "string",
      notNull: true,
      defaultValue: "",
    },
    contact: {
      type: "string",
      notNull: true,
      defaultValue: "",
    },
    default_rate: {
      type: "string",
      notNull: true,
      defaultValue: 100,
    },
  });
};

exports.down = function (db) {
  return db.dropTable("offices");
};

exports._meta = {
  version: 1,
};
