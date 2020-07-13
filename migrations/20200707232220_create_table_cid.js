
exports.up = function(knex) {
    return (
        knex.schema.createTable('cid', table => {
            table.string('cid').primary()
            table.string('nome').notNull()
        })
    )
};

exports.down = function(knex) {
    return (
        knex.schema.dropTable('cid')
    )
};
