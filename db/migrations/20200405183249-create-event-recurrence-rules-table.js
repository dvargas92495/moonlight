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
  return db.createTable("event_recurrence_rules", {
    event_id: {
      type: "int",
      notNull: true,
      primaryKey: true,
      foreignKey: {
        name: "fk_event_recurrence_rules_event_id_events_id",
        table: "events",
        mapping: "id",
        rules: {
          onDelete: "RESTRICT",
          onUpdate: "RESTRICT",
        },
      },
    },
    frequency: {
      type: "smallint",
      notNull: true,
      defaultValue: 0,
    },
    interval: {
      type: "int",
      notNull: true,
      defaultValue: 0,
    },
  });
};

exports.down = function (db) {
  return db.dropTable("patient_forms");
};

exports._meta = {
  version: 1,
};
