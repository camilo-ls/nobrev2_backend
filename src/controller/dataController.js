const db = require('../config/database')

class DataController {
    async getData(req, res) {
        const data = Date().toString()
        res.status(200).send(data)
    }
}

module.exports = new DataController()