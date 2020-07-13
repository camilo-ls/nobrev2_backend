
exports.up = function(knex) {
    return (
        knex.schema.createTable('procedimentos_cbo', table => {
            table.string('cbo').references('cbo').inTable('cbo')
            table.string('cod').references('cod').inTable('procedimentos')
        })
    )
};

exports.down = function(knex) {
    return (
        knex.schema.dropTable('procedimentos_cbo')
    )
};
