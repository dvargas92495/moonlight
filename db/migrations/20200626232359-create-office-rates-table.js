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
  return db.createTable("office_rates", {
    office_id: {
      type: "int",
      notNull: true,
      foreignKey: {
        name: "fk_office_rates_office_id_offices_id",
        table: "offices",
        mapping: "id",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
      },
    },
    specialist_id: {
      type: "int",
      notNull: true,
      defaultValue: 1,
    },
    rate: {
      type: "int",
      notNull: true,
      defaultValue: 100,
    },
    updated_date_utc: {
      type: "datetime",
      notNull: true,
    },
    updated_by: {
      type: "int",
      notNull: true,
      foreignKey: {
        name: "fk_office_rates_updated_by_users_id",
        table: "users",
        mapping: "id",
        rules: {
          onDelete: "RESTRICT",
          onUpdate: "RESTRICT",
        },
      },
    },
  });
};

exports.down = function (db) {
  return db.dropTable("office_rates");
};

exports._meta = {
  version: 1,
};
