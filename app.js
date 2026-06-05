const CSV_URL =
"https://docs.google.com/spreadsheets/u/0/d/1nlZSMyDzCxI8k6CkhG66B4uRjz7zrwT3VpCzJJPO7Dc/export?format=csv";

let allRows = [];
let currentMode = "total";

async function loadData() {
    const response = await fetch(CSV_URL);
    const csv = await response.text();

    return csv
        .trim()
        .split("\n")
        .map(row => row.split(","));
}

function createChart(elementId, labels, data, title) {

    const el = document.getElementById(elementId);

    const oldChart = echarts.getInstanceByDom(el);
    if (oldChart) {
        oldChart.dispose();
    }

    const chart = echarts.init(el);

    let min = Math.min(...data);
    let max = Math.max(...data);

    if (min === max) {
        min -= 1;
        max += 1;
    }

    chart.setOption({

        title: {
            text: title
        },

        tooltip: {
            trigger: "axis"
        },

        dataZoom:[
    {
        type:"inside",
        start:0,
        end:100,
        filterMode:"filter"
    },
    {
        type:"slider",
        start:0,
        end:100,
        filterMode:"filter"
    }
]
        xAxis: {
            type: "category",
            data: labels
        },

        yAxis: {
    type: "value",
    scale: true,
    min: function(value) {
        return value.min;
    },
    max: function(value) {
        return value.max;
    }
},
        
        series: [
            {
                type: "line",
                smooth: true,
                showSymbol: false,
                data: data
            }
        ]
    });

    return chart;
}

function renderCharts() {

    const labels = [];

    const views = [];
    const likes = [];
    const comments = [];

    for (let i = 1; i < allRows.length; i++) {

        labels.push(allRows[i][0]);

        if (currentMode === "total") {

            views.push(Number(allRows[i][1]));
            likes.push(Number(allRows[i][2]));
            comments.push(Number(allRows[i][3]));

        } else {

            views.push(Number(allRows[i][4]));
            likes.push(Number(allRows[i][5]));
            comments.push(Number(allRows[i][6]));
        }
    }

    createChart(
        "viewsChart",
        labels,
        views,
        currentMode === "total"
            ? "Просмотры"
            : "Прирост просмотров"
    );

    createChart(
        "likesChart",
        labels,
        likes,
        currentMode === "total"
            ? "Лайки"
            : "Прирост лайков"
    );

    createChart(
        "commentsChart",
        labels,
        comments,
        currentMode === "total"
            ? "Комментарии"
            : "Прирост комментариев"
    );
}

function switchMode(mode) {
    currentMode = mode;
    renderCharts();
}

async function init() {

    allRows = await loadData();

    const last = allRows[allRows.length - 1];

    document.getElementById("views").textContent =
        Number(last[1]).toLocaleString();

    document.getElementById("likes").textContent =
        Number(last[2]).toLocaleString();

    document.getElementById("comments").textContent =
        Number(last[3]).toLocaleString();

    renderCharts();
}

init();
