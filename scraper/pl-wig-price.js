const axios = require('axios');
const utils = require('./utils');

async function main() {
    const url = 'https://www.bankier.pl/new-charts/get-data?symbol=WIG&intraday=false&type=area&max_period=true';
    const json = (await axios.get(url)).data;

	const data = {};

	for (const item of json['main']) {
		const date = new Date(item[0]);
		const year = date.getFullYear();
		const price = item[1];

		if (!data[year]) {
			data[year] = [];
		}

		data[year].push(price);
	}

	for (const year of Object.keys(data)) {
		const avg = utils.avgArray(data[year]);

		console.log(`{ "year": ${year}, "value": ${avg} },`);
	}
}

main();
