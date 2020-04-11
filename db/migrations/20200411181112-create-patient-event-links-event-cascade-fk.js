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
  return db.addForeignKey(
    "patient_event_links",
    "events",
    "fk_patient_event_links_event_id_events_id",
    {
      event_id: "id",
    },
    {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT",
    }
  );
};

exports.down = function (db) {
  return db.removeForeignKey(
    "patient_event_links",
    "fk_patient_event_links_event_id_events_id",
    {
      dropIndex: true,
    }
  );
};

exports._meta = {
  version: 1,
};
