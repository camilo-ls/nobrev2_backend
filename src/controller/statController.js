const db = require('../config/database')

class statController {
    async create(req, res) {
        const novo = {...req.body}

        await db('tb_estatisticas_hist').insert(novo)
        .then(novoId => res.status(200).json({
            id: novoId,
            message: 'Registro inserido com sucesso.'
        }))
        .catch(e => res.status(400).json(e))
    }

    async delete(req, res) {
        const id = req.params.id

        await db('tb_estatisticas_hist').where({'id': id}).del()
        .then(resp => res.status(200).json(resp))
        .catch(e => res.status(500).json(e))
    }

    async listAgravo(req, res) {
        await db('tb_estatisticas_proced').distinct('agravo')
        .then(resp => res.status(200).json(resp))
        .catch(e => res.status(500).json(e))
    }

    async listCod(req, res) {
        const agravo = req.params.agravo
        await db('tb_estatisticas_proced').distinct('cod', 'nome')
        .where({'agravo': agravo})
        .then(resp => res.status(200).json(resp))
        .catch(e => res.status(500).json(e))
    }

    async listOwn(req, res) {
        const cns = req.params.cns
        await db('tb_estatisticas_hist').select().where({'cns': cns})
        .leftJoin('tb_estatisticas_proced', 'tb_estatisticas_hist.procedimento', 'tb_estatisticas_proced.cod')
        .orderBy([{column: 'ano', order: 'desc'}, {column: 'mes', order: 'desc'}, {column: 'dia', order: 'desc'}])
        .then(resp => res.status(200).json(resp))
        .catch(e => res.status(500).json(e))
    }

    async listAll(req, res) {
        await db('tb_estatisticas_hist').select('ano', 'mes', 'agravo', 'nome').sum('quantidade as quantidade')
        leftJoin('tb_estatisticas_proced', 'tb_estatisticas_hist.procedimento', 'tb_estatisticas_proced.cod')
        .groupBy('nome', 'mes', 'ano')
        .then(resp => res.status(200).json(resp))
        .catch(e => res.status(500).json(e))
    }
}

module.exports = new statController()