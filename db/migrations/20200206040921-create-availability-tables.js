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
  return db.createTable("availability", {
    user_id: {
      type: "int",
      primaryKey: true,
      notNull: true,
      foreignKey: {
        name: "fk_availability_user_id_users_id",
        table: "users",
        mapping: "id"
      }
    },
    work_hours_start: { type: "string", notNull: true },
    work_hours_end: { type: "string", notNull: true },
    work_days: { type: "int", notNull: true, unsigned: true }
  });
};

exports.down = function(db) {
  return db.dropTable("availability");
};

exports._meta = {
  version: 1
};
