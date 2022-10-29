const axios = require('axios');
const { parse } = require('csv-parse/sync');

async function main() {
    const url = 'https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/source-data/big-mac-source-data-v2.csv';
    const csvRaw = (await axios.get(url)).data;

	const csv = parse(csvRaw, {
		columns: true,
		skip_empty_lines: true
	});

	const data = {};

	csv.forEach(row => {
		if (row['name'] === 'Poland') {
			const year = row['date'].split('-')[0];
			const localPrice = parseFloat(row['local_price']);

			if (data[year] === undefined || data[year] < localPrice) {
				data[year] = localPrice;
			}
		}
	});

	Object.keys(data).forEach(year => {
		console.log(`{ "year": ${year}, "value": ${data[year]} },`);
	});
}

main();
