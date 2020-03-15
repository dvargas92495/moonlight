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
  return db.createTable("patient_event_links", {
    patient_id: {
      type: "int",
      notNull: true,
      foreignKey: {
        name: "fk_patient_event_links_patient_id_patients_id",
        table: "patients",
        mapping: "id",
        rules: {
          onDelete: "RESTRICT",
          onUpdate: "RESTRICT"
        }
      }
    },
    event_id: {
      type: "int",
      notNull: true,
      foreignKey: {
        name: "fk_patient_event_links_event_id_events_id",
        table: "events",
        mapping: "id",
        rules: {
          onDelete: "RESTRICT",
          onUpdate: "RESTRICT"
        }
      }
    }
  });
};

exports.down = function(db) {
  return db.dropTable("patient_event_links");
};

exports._meta = {
  version: 1
};
