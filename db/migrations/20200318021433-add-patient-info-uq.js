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
    "patient_identifiers",
    "UQ_patient_identifiers_patient_id_type",
    ["patient_id", "type"],
    true
  );
};

exports.down = function(db) {
  return db.removeIndex(
    "patient_identifiers",
    "UQ_patient_identifiers_patient_id_type"
  );
};

exports._meta = {
  version: 1
};
