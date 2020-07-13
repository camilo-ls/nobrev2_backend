
exports.up = function(knex) {
    return (
        knex.schema.createTable('cnes', table =>{
            table.integer('cnes').unsigned().primary()
            table.string('nome').notNull()
            table.string('nome_pmp')
            table.string('tipologia').notNull()
            table.string('tipo').notNull()
            table.string('bairro').notNull()  
            table.boolean('ativo').notNull().defaultTo(true)          
        })
    )  
};

exports.down = function(knex) {
    return (
        knex.schema.dropTable('cnes')
    )
};
