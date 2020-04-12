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
  return db.createTable("refresh_tokens", {
    user_id: {
      type: "int",
      primaryKey: true,
      notNull: true,
      foreignKey: {
        name: "fk_refresh_tokens_user_id_users_id",
        table: "users",
        mapping: "id",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
      },
    },
    token: { type: "string", notNull: true },
  });
};

exports.down = function (db) {
  return db.dropTable("refresh_tokens");
};

exports._meta = {
  version: 1,
};
