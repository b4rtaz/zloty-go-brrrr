const fs = require('fs');

function createRow(year, value) {
	return `{ "year": ${year}, "value": ${value.toFixed(2)} },\n`;
}

async function main() {
	const json = JSON.parse(fs.readFileSync('../data/pl-inflation.json', 'utf8'));

	const startYear = 2000;
	const endYear = 2022;

	let upOutput = '';
	let downOutput = '';
	let upValue = 1000;
	let downValue = 1000;

	for (let year = startYear; year <= endYear; year++) {
		upOutput += createRow(year, upValue);
		downOutput += createRow(year, downValue);

		const item = json.data.find(i => i.year === year);
		const percent = (item.value + 100) / 100;
		upValue *= percent;
		downValue /= percent;
	}

	console.log('--- up ---');
	console.log(upOutput);
	console.log('--- down ---');
	console.log(downOutput);
}

main();
