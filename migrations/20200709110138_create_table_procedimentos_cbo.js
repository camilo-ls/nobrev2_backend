
exports.up = function(knex) {
    return (
        knex.schema.createTable('procedimentos_cbo', table => {
            table.integer('cbo').unsigned().references('cbo').inTable('cbo')
            table.bigInteger('cod').references('cod').inTable('procedimentos')
        })
    )
};

exports.down = function(knex) {
    return (
        knex.schema.dropTable('procedimentos_cbo')
    )
};
