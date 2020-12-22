// Update with your config settings.

module.exports = {
  client: 'mysql',
  connection: {
    host: 'localhost',    
    database: 'nobre',
    user:     'root',
    password: 'root'
  },
  pool: {
    min: 1,
    max: 5
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};
