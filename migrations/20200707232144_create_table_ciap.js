
exports.up = function(knex) {
    return (
        knex.schema.createTable('ciap', table => {
            table.string('ciap').primary()
            table.string('nome').notNull()
        })
    )
};

exports.down = function(knex) {
    return (
        knex.schema.dropTable('ciap')
    )  
};
