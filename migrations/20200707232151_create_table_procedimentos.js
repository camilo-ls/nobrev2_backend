
exports.up = function(knex) {
    return (
        knex.schema.createTable('procedimentos', table => {
            table.string('cod').primary()
            table.string('nome').notNull()
            table.string('descricao')
        })
    )
};

exports.down = function(knex) {
    return (
        knex.schema.dropTable('procedimentos')
    )
};
