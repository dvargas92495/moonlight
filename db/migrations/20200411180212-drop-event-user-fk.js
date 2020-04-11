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
  return db.removeForeignKey("events", "fk_events_user_id_users_id", {
    dropIndex: true,
  });
};

exports.down = function (db) {
  return db.addForeignKey(
    "events",
    "users",
    "fk_events_user_id_users_id",
    {
      user_id: "id",
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
