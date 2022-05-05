// coin flip functions
function coinFlip() {
    return Math.random() > .5 ? "heads" : "tails"
}

function coinFlips(flips) {
    flips = Number(flips)
    let results = []
    let flip = 0
    while (flip < flips) {
        results[flip] = coinFlip()
        flip = flip + 1
    }
    return results
}


function countFlips(array) {
    let h = 0
    let t = 0
    for (let f in array) {
        if (array[f] === 'heads') {
            h += 1
        } else {
            t += 1
        }
    }

    if (t == 0) {
        return { 'heads': h }
    }

    if (h == 0) {
        return { 'tails': t }
    }

    return { 'heads': h, 'tails': t }

}

function flipACoin(call) {
    let flip = coinFlip()
    let result = ""
    if (flip === call) {
        result = 'win'
    } else {
        result = 'lose'
    }

    return { 'call': call, 'flip': flip, 'result': result }

}

module.exports = {
    coinFlips: coinFlips,
    flipACoin: flipACoin,
    countFlips: countFlips,
    coinFlip: coinFlip
};