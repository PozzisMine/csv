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
    if (oldChart) oldChart.dispose();

    const chart = echarts.init(el);

    chart.setOption({

        title: {
            text: title
        },

        tooltip: {
            trigger: "axis",
            formatter: function(params){

                const p = params[0];

                return `
                    ${p.axisValue}<br>
                    👁 ${Number(p.value).toLocaleString()}
                `;
            }
        },

        dataZoom: [
            {
                type: "inside",
                start: 0,
                end: 100
            },
            {
                type: "slider",
                start: 0,
                end: 100
            }
        ],

        xAxis: {
            type: "category",
            data: labels
        },

        yAxis: {
            type: "value",
            scale: true
        },

        series: [
            {
                type: "line",
                smooth: false,
                showSymbol: true,
                symbolSize: 5,
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

    for(let i = 1; i < allRows.length; i++){

        labels.push(allRows[i][0]);

        if(currentMode === "total"){

            views.push(Number(allRows[i][1]));
            likes.push(Number(allRows[i][2]));
            comments.push(Number(allRows[i][3]));

        }else{

            views.push(Number(allRows[i][4] || 0));
            likes.push(Number(allRows[i][5] || 0));
            comments.push(Number(allRows[i][6] || 0));
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

function renderTable() {

    const tbody =
        document.querySelector("#statsTable tbody");

    if(!tbody) return;

    tbody.innerHTML = "";

    const selectedDate =
        document.getElementById("dateFilter")?.value || "";

    for(let i = allRows.length - 1; i >= 1; i--){

        const row = allRows[i];

        if(
            selectedDate &&
            !row[0].startsWith(selectedDate)
        ){
            continue;
        }

        tbody.innerHTML += `
        <tr>
            <td>${row[0]}</td>
            <td>${Number(row[1]).toLocaleString()}</td>
            <td>${Number(row[2]).toLocaleString()}</td>
            <td>${Number(row[3]).toLocaleString()}</td>
            <td>+${Number(row[4] || 0).toLocaleString()}</td>
            <td>+${Number(row[5] || 0).toLocaleString()}</td>
            <td>+${Number(row[6] || 0).toLocaleString()}</td>
        </tr>
        `;
    }
}

function switchMode(mode) {
    currentMode = mode;
    renderCharts();
}

async function updateData() {

    allRows = await loadData();

    const last =
        allRows[allRows.length - 1];

    document.getElementById("views").textContent =
        Number(last[1]).toLocaleString();

    document.getElementById("likes").textContent =
        Number(last[2]).toLocaleString();

    document.getElementById("comments").textContent =
        Number(last[3]).toLocaleString();

    renderCharts();
    renderTable();
}

async function init() {
    await updateData();
}

init();

setInterval(async () => {
    await updateData();
}, 60000);
