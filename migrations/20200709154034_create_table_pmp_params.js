exports.up = function(knex) {
    return (
          knex.schema.createTable('pmp_params', table => {
            table.integer('mes').notNull().unsigned()
            table.integer('ano').notNull().unsigned()
            table.integer('ine').unsigned().references('ine').inTable('equipes')
            table.integer('cbo').unsigned().references('cbo').inTable('cbo')
            table.bigInteger('procedimento').references('cod').inTable('procedimentos')
        })
      ) 
  };
  
  exports.down = function(knex) {
      return (
          knex.schema.dropTable('pmp_params')
      )
  };
  