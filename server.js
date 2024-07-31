const express = require("express")
const cors = require("cors")
const fs = require('fs')
const path = require("path")

const app = express()
app.use(cors())
const PORT = 5500
const cachedData = new Map()

app.get("/", (req, res, err) => {
    res.json({ "ERR": "No data here" })
})

app.get("/:year", (req, res, err) => {
    const year = req.params.year
    //check for validity of the request
    if (isNaN(year)) {
        return res.json({ "ERR": "No data here" })
    }
    if (year < 1957 || year > new Date().getFullYear()) {
        return res.json({ "ERR": "No data here" })
    }

    //check if data has already been accessed
    if (cachedData.has(year)) {
        return res.json(cachedData.get(year))
    }

    fs.readFile(path.join(__dirname, "data", `${year}.json`), (err, dataBuffer) => {
        if (err) {
            console.error(err)
            return res.json({ "ERR": "Error reading data" })
        }
        const data = JSON.parse(dataBuffer)
        res.json(data)
        cachedData.set(year, data)
    })
})

app.get("/:year1/:year2", (req, res, err) => {
    const year1 = req.params.year1
    const year2 = req.params.year2

    if (isNaN(year1) || isNaN(year2)) {
        return res.json({ "ERR": "Couldn't find data for provided information" })
    }
    if (year1 < 1957 ||
        year2 < 1957 ||
        year1 > new Date().getFullYear() ||
        year2 > new Date().getFullYear()) {
        return res.json({ "ERR": "Year out of range" })
    }
    if (year1 === year2) {
        return res.redirect(`/${year1}`)
    }

    const resArr = []
    for (let i = year1 < year2 ? year1 : year2; i <= year1 || i <= year2; i++) {
        //check if data has already been accessed
        if (cachedData.has(i)) {
            resArr.push(cachedData.get(i))
        } else {
            let readData = null
            try {
                readData = fs.readFileSync(path.join(__dirname, "data", `${i}.json`))
            } catch (e) {
                console.error(e)
                console.error(`Problem reading data from ${i}...`)
                continue
            }
            const dataJSON = JSON.parse(readData)
            resArr.push(dataJSON)
            cachedData.set(i, dataJSON)
        }
    }

    return res.json(resArr)
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
