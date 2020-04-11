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
  return db.removeForeignKey(
    "patient_event_links",
    "fk_patient_event_links_patient_id_patients_id",
    {
      dropIndex: true,
    }
  );
};

exports.down = function (db) {
  return db.addForeignKey(
    "patient_event_links",
    "patients",
    "fk_patient_event_links_patient_id_patients_id",
    {
      patient_id: "id",
    },
    {
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT",
    }
  );
};

exports._meta = {
  version: 1,
};
