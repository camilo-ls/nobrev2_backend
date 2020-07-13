exports.up = function(knex) {
    return (
        knex.schema.createTable('equipes', table => {
            table.integer('ine').unsigned().primary()
            table.string('nome').notNull()
            table.integer('tipo')
            table.string('tipo_desc')
            table.integer('cnes').unsigned().references('cnes').inTable('cnes')
            table.boolean('loc_cnes').notNull().defaultTo(true)
            table.boolean('ativo').notNull().defaultTo(true)
      })
  )
};

exports.down = function(knex) {
    return (
        knex.schema.dropTable('equipe')
    )
};
