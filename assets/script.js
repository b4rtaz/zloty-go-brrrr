
const colors = ['#C81B50', '#2f1bc8', '#1ec81b'];
let setsUrls = null;
let sets = null;
let chart = null;

function fillSelect(setSelect, letter, selectedId) {
    for (const setId of Object.keys(sets)) {
        const option = document.createElement('option');
        option.value = setId;
        option.innerText = `${letter}: ` + sets[setId].title['pl'];
        if (setId === selectedId) {
            option.setAttribute('selected', '');
        }
        setSelect.appendChild(option);
    }
}

function render(labels, datasets) {
    if (chart) {
        chart.destroy();
    }
    const context = document.getElementById('chart-canvas').getContext('2d');
    const scales = {
        y0: {
            type: 'linear',
            display: true,
            position: 'left',
        },
    };
    if (datasets.length > 1 && datasets[1].yAxisID !== 'y0') {
        scales['y1'] = {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
                drawOnChartArea: false,
            },
        };
    }
    chart = new Chart(context, {
        type: 'line',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales,
        }
    });
}

function updateHash(set1Id, set2Id, mode) {
    location.hash = `${set1Id}/${mode}/${set2Id}`;
}

function readHash() {
    if (location.hash) {
        const parts = location.hash.substring(1).split('/');
        return { set1Id: parts[0], set2Id: parts[2] };
    }
    return null;
}

function readMinMax(sets) {
    const allYears = sets.map(set => set.data.map(item => item.year)).flat();
    const minYear = Math.min(...allYears);
    const maxYear = Math.max(...allYears);
    return { minYear, maxYear };
}

function renderCompareMode(selectedSets) {
    const { minYear, maxYear } = readMinMax(selectedSets);
    const labels = [];
    const haveSameUnits = (selectedSets[0].unit === selectedSets[1].unit);

    const datasets = selectedSets.map((set, index) => {
        return {
            label: set.title['pl'],
            data: [],
            borderColor: colors[index],
            borderWidth: 4,
            yAxisID: `y${haveSameUnits ? 0 : index}`
        };
    });

    for (let year = minYear; year <= maxYear; year++) {
        labels.push(String(year));

        for (let setIndex = 0; setIndex < selectedSets.length; setIndex++) {
            const set = selectedSets[setIndex];
            const item = set.data.find(i => i.year === year);
            datasets[setIndex].data.push(item
                ? item.value
                : null);
        }
    }
    render(labels, datasets);
}

function renderAggregateMode(selectedSets, sign, aggregate) {
    const { minYear, maxYear } = readMinMax(selectedSets);
    const labels = [];
    const data = [];

    for (let year = minYear; year <= maxYear; year++) {
        const item1 = selectedSets[0].data.find(i => i.year === year);
        const item2 = selectedSets[1].data.find(i => i.year === year);
        labels.push(String(year));
        if (item1 && item2) {
            data.push(aggregate(item1.value, item2.value));
        } else {
            data.push(null);
        }
    }

    render(labels, [
        {
            label: `A ${sign} B`,
            data,
            borderColor: '#000',
            borderWidth: 4,
            yAxisID: 'y0'
        }
    ]);
}

function updateDataSources(selectedSets) {
    const dataSources = document.getElementById('data-sources');
    dataSources.innerHTML = '';

    for (const set of selectedSets) {
        if (dataSources.children.length > 0) {
            dataSources.appendChild(document.createTextNode(', '));
        }
        const link = document.createElement('a');
        link.innerText = new URL(set.source).host;
        link.setAttribute('href', set.source);
        link.setAttribute('target', '_blank');
        dataSources.appendChild(link);
    }
}

async function main() {
    const setsIds = setsUrls.map(url => url.replace(/\..*/, ''));
    const responses = await Promise.all(setsUrls.map(url => fetch(`./data/${url}`)));
    const setsData = await Promise.all(responses.map(response => response.json()));
    sets = setsIds.reduce((result, setId, index) => {
        result[setId] = setsData[index];
        return result;
    }, {});

    let hashIds = readHash();
    if (hashIds && (!setsIds.includes(hashIds.set1Id) || !setsIds.includes(hashIds.set2Id))) {
        hashIds = null;
    }

    const modeSelect = document.getElementById('mode');
    const set1Select = document.getElementById('set1');
    const set2Select = document.getElementById('set2');
    fillSelect(set1Select, 'A', hashIds ? hashIds.set1Id : setsIds[0]);
    fillSelect(set2Select, 'B', hashIds ? hashIds.set2Id : setsIds[1]);
    modeSelect.addEventListener('change', open);
    set1Select.addEventListener('change', open);
    set2Select.addEventListener('change', open);

    function open() {
        const set1Id = set1Select.value;
        const set2Id = set2Select.value;
        const selectedSets = [
            sets[set1Id],
            sets[set2Id]
        ];

        switch (modeSelect.value) {
            case 'compare':
                renderCompareMode(selectedSets);
                break;
            case 'ratio':
                renderAggregateMode(selectedSets, '+', (a, b) => {
					return (b === 0) ? 0 : (a / b);
				});
                break;
			case 'difference':
				renderAggregateMode(selectedSets, '-', (a, b) => a - b);
				break;
			case 'sum':
				renderAggregateMode(selectedSets, '+', (a, b) => a + b);
				break;
        }
        updateHash(set1Id, set2Id, modeSelect.value);
        updateDataSources(selectedSets);
    }

    open();
}

function setup(urls) {
    setsUrls = urls;
}

document.addEventListener('DOMContentLoaded', main);
