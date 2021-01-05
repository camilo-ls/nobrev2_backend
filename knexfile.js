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
    min: 1,
    max: 5
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};