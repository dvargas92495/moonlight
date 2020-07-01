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
  return db.addIndex(
    "office_vcita_links",
    "UQ_office_vcita_links_client_id_office_id",
    ["office_id", "client_id"],
    true
  );
};

exports.down = function (db) {
  return db.removeIndex(
    "office_vcita_links",
    "UQ_office_vcita_links_client_id_office_id"
  );
};

exports._meta = {
  version: 1,
};
