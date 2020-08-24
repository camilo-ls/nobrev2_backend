// Update with your config settings.

module.exports = {
  client: 'mysql',
  connection: {
    host: 'dcid.semsa',    
    database: 'nobre',
    user:     'nobre',
    password: 'gretinha'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};
