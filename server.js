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
        return res.json({ "data": cachedData.get(year) })
    }

    fs.readFile(path.join(__dirname, "data", `${year}.json`), (err, dataBuffer) => {
        if (err) {
            console.error(err)
            return res.json({ "ERR": "Error reading data" })
        }
        const data = JSON.parse(dataBuffer)
        res.json({ "DATA": data })
        cachedData.set(year, data)
    })
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})