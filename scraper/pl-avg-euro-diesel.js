const htmlParser = require('node-html-parser');
const axios = require('axios');
const utils = require('./utils');

async function main() {
    const url = 'https://www.lotos.pl/145/type,oil_eurodiesel/dla_biznesu/hurtowe_ceny_paliw/archiwum_cen_paliw';
    const htmlText = (await axios.get(url)).data;
    const html = htmlParser.parse(htmlText);

    const trs = html.querySelectorAll('.static-text table tbody tr');

    const data = {};

    for (const tr of trs) {
        const tds = tr.querySelectorAll('td');
        const dateText = tds[0].innerText; // Data zmiany
        const priceText = tds[1].innerText; // Cena

        const year = parseInt(dateText.split('-')[0]);
        const price = parseFloat(priceText.replace(' ', '').replace(',', '.'));

        if (price === 0) {
            continue;
        }

        if (!data[year]) {
            data[year] = [];
        }
        data[year].push(price);
    }

    Object.keys(data).forEach(year => {
        const avg = utils.avgArray(data[year]);
        console.log(`{ "year": ${year}, "value": ${avg} },`);
    });
}

main();
