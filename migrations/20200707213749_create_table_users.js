
exports.up = function(knex) {
  return (
      knex.schema.createTable('users', table => {
      table.increments('id').primary()
      table.integer('nivel').notNull().defaultTo(0)
      table.string('nome').notNull()
      table.string('email').notNull()
      table.string('password').notNull()
      table.boolean('admin').notNull().defaultTo(false)
      table.boolean('ativo').notNull().defaultTo(true)
    })
  )
};

exports.down = function(knex) {
  return (
    knex.schema.dropTable('users')
  )
};
