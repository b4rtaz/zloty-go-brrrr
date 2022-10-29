const htmlParser = require('node-html-parser');
const axios = require('axios');
const utils = require('./utils');

async function main() {
    const url = 'https://stat.gov.pl/obszary-tematyczne/przemysl-budownictwo-srodki-trwale/budownictwo/cena-1-m2-powierzchni-uzytkowej-budynku-mieszkalnego-oddanego-do-uzytkowania,8,1.html';
    const htmlText = (await axios.get(url)).data;
    const html = htmlParser.parse(htmlText);

    const trs = html.querySelectorAll('.tabelkaszara tr');

    for (const tr of trs) {
		const tds = tr.querySelectorAll('th, td');
		if (tds.length !== 5) {
			continue;
		}
		const q1 = tds[1].innerText;
		const q2 = tds[2].innerText;
		const q3 = tds[3].innerText;
		const q4 = tds[4].innerText;
		if (q1.includes('kwartał')) { // skip headers
			continue;
		}
		const year = parseInt(tds[0].innerText);
		const values = [q1, q2, q3, q4]
			.filter(v => !v.includes('&nbsp;'))
			.map(v => parseInt(v.replace(' ', '')));
		const avg = utils.avgArray(values);
		// console.log(`items = ${values.join(', ')}`);
		console.log(`{ "year": ${year}, "value": ${avg} },`);
    }
}

main();
