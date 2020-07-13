exports.up = function(knex) {
    return (
        knex.schema.createTable('pmp_hist', table => {
            table.integer('mes').notNull().unsigned()
            table.integer('ano').notNull().unsigned()
            table.integer('ine').unsigned().references('ine').inTable('equipes')
            table.integer('cnes').unsigned().references('cnes').inTable('cnes')
            table.bigInteger('cns').unsigned().notNull()
            table.integer('coeficiente').notNull().defaultTo(1)
            table.integer('param').notNull().defaultTo(1)
        })
    )
};

exports.down = function(knex) {
    return (
        knex.schema.dropTable('pmps_hist')
    )
};