
exports.up = function(knex) {
    return (
        knex.schema.createTable('cbo', table => {
            table.integer('cbo').primary().unsigned()
            table.string('nome').notNull()
        })
    )
};

exports.down = function(knex) {
    return (
        knex.schema.dropTable('cbo')
    )
};
