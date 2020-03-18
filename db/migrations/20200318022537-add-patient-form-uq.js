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
    "patient_forms",
    "UQ_patient_forms_patient_id_name",
    ["patient_id", "name"],
    true
  );
};

exports.down = function(db) {
  return db.removeIndex("patient_forms", "UQ_patient_forms_patient_id_name");
};

exports._meta = {
  version: 1
};
