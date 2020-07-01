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
  return db.createTable("office_vcita_links", {
    client_id: {
      type: "string",
      notNull: true,
      foreignKey: {
        name: "fk_office_vcita_links_client_id_vcita_clients_client_id",
        table: "vcita_clients",
        mapping: "client_id",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
      },
    },
    office_id: {
      type: "int",
      notNull: true,
      foreignKey: {
        name: "fk_office_vcita_links_office_id_offices_id",
        table: "offices",
        mapping: "id",
        rules: {
          onDelete: "CASCADE",
          onUpdate: "RESTRICT",
        },
      },
    },
  });
};

exports.down = function (db) {
  return db.dropTable("office_vcita_links");
};

exports._meta = {
  version: 1,
};
