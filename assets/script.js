
const colors = ['#C81B50', '#2f1bc8', '#1ec81b'];
let chart = null;

function fillSelect(setSelect, sets, letter, selectedIndex) {
    for (let setIndex = 0; setIndex < sets.length; setIndex++) {
        const option = document.createElement('option');
        option.value = setIndex;
        option.innerText = `${letter}: ` + sets[setIndex].title['pl'];
        if (setIndex === selectedIndex) {
            option.setAttribute('selected', '');
        }
        setSelect.appendChild(option);
    }
}

function render(labels, datasets) {
    if (chart) {
        chart.destroy();
    }
    const context = document.getElementById('chart').getContext('2d');
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

function readMinMax(sets) {
    const allYears = sets.map(set => set.data.map(item => item.year)).flat();
    const minYear = Math.min(...allYears);
    const maxYear = Math.max(...allYears);
    return { minYear, maxYear };
}

function renderCompare(sets) {
    const { minYear, maxYear } = readMinMax(sets);
    const labels = [];
    const haveSameUnits = (sets[0].unit === sets[1].unit);

    const datasets = sets.map((set, index) => {
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

        for (let setIndex = 0; setIndex < sets.length; setIndex++) {
            const set = sets[setIndex];
            const item = set.data.find(i => i.year === year);
            datasets[setIndex].data.push(item
                ? item.value
                : null);
        }
    }
    render(labels, datasets);
}

function renderRatio(sets) {
    const { minYear, maxYear } = readMinMax(sets);
    const labels = [];
    const data = [];
    
    for (let year = minYear; year <= maxYear; year++) {
        const item1 = sets[0].data.find(i => i.year === year);
        const item2 = sets[1].data.find(i => i.year === year);
        labels.push(String(year));
        if (item1 && item2) {
            data.push((item2.value === 0) ? 0 : (item1.value / item2.value));
        } else {
            data.push(null);
        }
    }

    render(labels, [
        {
            label: 'A ÷ B',
            data,
            borderColor: '#000',
            borderWidth: 4,
            yAxisID: 'y0'
        }
    ]);
}

async function main() {
    const list = await (await fetch('./data/list.json')).json();
    const responses = await Promise.all(list.map(item => fetch(`./data/${item}`)));
    const sets = await Promise.all(responses.map(response => response.json()));

    const modeSelect = document.getElementById('mode');
    const set1Select = document.getElementById('set1');
    const set2Select = document.getElementById('set2');
    fillSelect(set1Select, sets, 'A', 0);
    fillSelect(set2Select, sets, 'B', 1);
    modeSelect.addEventListener('change', reload);
    set1Select.addEventListener('change', reload);
    set2Select.addEventListener('change', reload);

    function reload() {
        const set1Index = parseInt(set1Select.value);
        const set2Index = parseInt(set2Select.value);
        const selectedSets = [
            sets[set1Index],
            sets[set2Index]
        ];

        switch (modeSelect.value) {
            case 'compare':
                renderCompare(selectedSets);
                break;
            case 'ratio':
                renderRatio(selectedSets);
                break;
        }
    }

    reload();
}

document.addEventListener('DOMContentLoaded', main);
