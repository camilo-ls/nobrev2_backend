exports.up = function(knex) {
    return (
          knex.schema.createTable('pmp_params', table => {
            table.integer('mes').notNull().unsigned()
            table.integer('ano').notNull().unsigned()
            table.integer('ine').unsigned().references('ine').inTable('equipes')
            table.string('cbo').references('cbo').inTable('cbo')
            table.string('procedimento').references('cod').inTable('procedimentos')
        })
      ) 
  };
  
  exports.down = function(knex) {
      return (
          knex.schema.dropTable('pmp_params')
      )
  };
  