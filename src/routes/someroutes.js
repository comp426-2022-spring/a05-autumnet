const express = require("express");
const flipFuncs = require("../utils/utilities.js");
const db = require('../services/database.js');
const routesF = express.Router()

// one flip
routesF.route('/app/flip/').get(function (req, res, next) {
    const flip = flipFuncs.coinFlip()
    res.status(200).json({'flip': flip})
})

routesF.route('/app/flip/coin/').get(function (req, res) {
    res.status(200).json({ 'flip': flipFuncs.coinFlip() })
});

// multiple flips
routesF.route('/app/flip/coins/').post(function (req, res, next) {
    try {
        const raw = flipFuncs.coinFlips(req.body.number)
        const summ = flipFuncs.countFlips(raw)

        res.status(200).json({'raw': raw, 'summ': summ})
    } catch {
        res.status(404).json({'raw': 'error', 'summ': 'error'})
    }
})

routesF.route('/app/flips/:number').get(function (req, res) {
    const flips = flipFuncs.coinFlips(req.params.number)
    const count = flipFuncs.countFlips(flips)
    res.status(200).json({ "raw": flips, "summary": count })
});

// guess flip
routesF.route('/app/flip/call/').post(function (req, res, next) {
    const flip = flipFuncs.flipACoin(req.body.guess)
    res.status(200).json(flip)
})

routesF.route('/app/flip/call/:guess/').get(function (req, res) {
    const game = flipFuncs.flipACoin(req.params.guess)
    res.status(200).json(game)
})

routesF.route('/app/log/access').get(function (req, res, next) {
    try {
        const stmt = db.prepare("SELECT * FROM accesslog").all()
        res.status(200).json(stmt)
    } catch {
        console.error(res)
    }
});

routesF.route('/app/error/').get(function (req, res, next) {
    throw new Error("Error Test Successful.");
});

module.exports = routesF