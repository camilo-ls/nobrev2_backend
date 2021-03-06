exports.up = function(knex) {
    return (
        knex.schema.createTable('profissionais', table => {
            table.increments('id').primary()
            table.string('cpf').notNull()
            table.string('cns').notNull()
            table.string('nome').notNull()
            table.string('cbo').references('cbo').inTable('cbo')
            table.integer('cnes').unsigned().references('cnes').inTable('cnes')
            table.integer('ine').unsigned().references('ine').inTable('equipes')
            table.integer('ch_amb').notNull().defaultTo(0)
            table.integer('ch_hosp').notNull().defaultTo(0)
            table.integer('ch_outra').notNull().defaultTo(0)
            table.boolean('ativo').notNull().defaultTo(true)
        })
    )
};

exports.down = function(knex) {
    return (
        knex.schema.dropTable('profissionais')
    )
};
