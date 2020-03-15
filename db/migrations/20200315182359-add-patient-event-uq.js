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
  return db.addIndex(
    "patient-event-links",
    "UQ_patient_event_links_patient_id_event_id",
    ["patient_id", "event_id"],
    true
  );
};

exports.down = function(db) {
  return db.removeIndex(
    "patient-event-links",
    "UQ_patient_event_links_patient_id_event_id"
  );
};

exports._meta = {
  version: 1
};
