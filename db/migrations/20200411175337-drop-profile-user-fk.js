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
  return db.removeForeignKey("profile", "fk_profile_user_id_users_id", {
    dropIndex: true,
  });
};

exports.down = function (db) {
  return db.addForeignKey(
    "profile",
    "users",
    "fk_profile_user_id_users_id",
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
