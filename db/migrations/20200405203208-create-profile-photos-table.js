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
  return db.createTable("profile_photos", {
    user_id: {
      type: "int",
      notNull: true,
      foreignKey: {
        name: "fk_profile_photos_user_id_users_id",
        table: "patients",
        mapping: "id",
        rules: {
          onDelete: "RESTRICT",
          onUpdate: "RESTRICT",
        },
      },
    },
    name: { type: "string", notNull: true },
    size: { type: "int", notNull: true, defaultValue: 0 },
  });
};

exports.down = function (db) {
  return db.dropTable("profile_photos");
};

exports._meta = {
  version: 1,
};
