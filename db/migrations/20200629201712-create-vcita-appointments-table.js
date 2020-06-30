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
  return db.createTable("vcita_appointments", {
    appointment_id: { type: "string", notNull: true, primaryKey: true },
    start_time: { type: "string", notNull: true, defaultValue: "" },
    end_time: { type: "string", notNull: true, defaultValue: "" },
    client_id: { type: "string", notNull: true, defaultValue: "" },
    staff_id: { type: "string", notNull: true, defaultValue: "" },
  });
};

exports.down = function (db) {
  return db.dropTable("vcita_appointments");
};

exports._meta = {
  version: 1,
};
