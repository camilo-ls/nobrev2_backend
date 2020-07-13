
exports.up = function(knex) {
    return (
        knex.schema.createTable('equipes_tipo', table => {
            table.integer('tipo').primary()
            table.string('nome').notNull()
        })
    )
};

exports.down = function(knex) {
  
};
