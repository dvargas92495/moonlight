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
  return db.createTable("patient_identifiers", {
    patient_id: {
      type: "int",
      primaryKey: true,
      notNull: true,
      foreignKey: {
        name: "fk_patient_identifiers_patient_id_patients_id",
        table: "patients",
        mapping: "id",
        rules: {
          onDelete: "RESTRICT",
          onUpdate: "RESTRICT"
        }
      }
    },
    type: { type: "int", notNull: true },
    value: { type: "string", notNull: true }
  });
};

exports.down = function(db) {
  return db.dropTable("patient_identifiers");
};

exports._meta = {
  version: 1
};
