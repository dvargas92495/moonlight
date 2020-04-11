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
    "event_recurrence_rules",
    "fk_event_recurrence_rules_event_id_events_id",
    {
      dropIndex: true,
    }
  );
};

exports.down = function (db) {
  return db.addForeignKey(
    "event_recurrence_rules",
    "events",
    "fk_event_recurrence_rules_event_id_events_id",
    {
      event_id: "id",
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
