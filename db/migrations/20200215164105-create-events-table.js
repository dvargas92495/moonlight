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
  return db.createTable("events", {
    id: { type: "int", primaryKey: true, autoIncrement: true, notNull: true },
    user_id: {
      type: "int",
      notNull: true,
      foreignKey: {
        name: "fk_events_user_id_users_id",
        table: "users",
        mapping: "id",
        rules: {
          onDelete: "RESTRICT",
          onUpdate: "RESTRICT"
        }
      }
    },
    created_by: {
      type: "int",
      notNull: true,
      foreignKey: {
        name: "fk_events_created_by_users_id",
        table: "users",
        mapping: "id",
        rules: {
          onDelete: "RESTRICT",
          onUpdate: "RESTRICT"
        }
      }
    },
    subject: { type: "string", notNull: true },
    start_time: { type: "datetime", notNull: true },
    end_time: { type: "datetime", notNull: true }
  });
};

exports.down = function(db) {
  return db.dropTable("events");
};

exports._meta = {
  version: 1
};
