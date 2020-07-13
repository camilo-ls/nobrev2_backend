
exports.up = function(knex) {
    return (
        knex.schema.createTable('cbo', table => {
            table.string('cbo').primary()
            table.string('nome').notNull()
        })
    )
};

exports.down = function(knex) {
    return (
        knex.schema.dropTable('cbo')
    )
};
