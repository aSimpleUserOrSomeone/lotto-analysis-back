const puppeteer = require('puppeteer')
const fs = require('fs');
const path = require("path")
const dataPath = path.join(__dirname, "data")

async function getData(writePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage()
    // const data = {losowania: []}

    await page.goto("https://megalotto.pl/wyniki/lotto")

    const lata = await page.$$eval(".lista_lat a", (rok) => {
        return rok.map(el => el.textContent)
    })
    //Do tego momentu zbiera informacje o wszystkich latach losowań
    //aby uzyc ich do nawigacji

    const isBreak = false
    console.log("Początek zbierania danych...");
    for (const rok of lata) {
        const infoRok = [];
        console.log("Zbieranie danych z: " + rok);
        await page.goto(`https://megalotto.pl/wyniki/lotto/losowania-z-roku-${rok}`)

        const rows = await page.$$("#list_of_last_drawings_wyniki_lotto > div > ul")

        for (const row of rows) {
            const id = await row.$eval(".nr_in_list", element => element.textContent.trim().slice(0, -1))
            const data = await row.$eval(".date_in_list", element => element.textContent)
            const liczby = await row.$$eval(".numbers_in_list", element => element.map(x => x.textContent.trim()))

            infoRok.push({ id, data, liczby })
        }
        infoRok.reverse()

        if(!fs.existsSync(writePath)) {
            fs.mkdirSync(writePath)
        }
        const filePath = path.join(writePath, `${rok}.json`)
        fs.writeFile(filePath, JSON.stringify(infoRok), (err) => {
            if (err) console.error(err)
        })
    }

    await browser.close()
    console.log("Zakończono zbieranie danych!");
}

getData(dataPath);