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

    chart.setOption({

        title: {
            text: title,
            textStyle: {
                color: "#ffffff"
            }
        },

        tooltip: {
            trigger: "axis"
        },

        dataZoom: [
            {
                type: "inside",
                start: 0,
                end: 100,
                filterMode: "filter"
            },
            {
                type: "slider",
                start: 0,
                end: 100,
                filterMode: "filter"
            }
        ],

        xAxis: {
            type: "category",
            data: labels,
            axisLabel: {
                color: "#ffffff"
            }
        },

        yAxis: {
            type: "value",
            scale: true,
            axisLabel: {
                color: "#ffffff"
            }
        },

        series: [
            {
                name: title,
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

            views.push(Number(allRows[i][1]) || 0);
            likes.push(Number(allRows[i][2]) || 0);
            comments.push(Number(allRows[i][3]) || 0);

        } else {

            views.push(Number(allRows[i][4]) || 0);
            likes.push(Number(allRows[i][5]) || 0);
            comments.push(Number(allRows[i][6]) || 0);
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

    const table = document.getElementById("statsTable");

    if (!table) return;

    let html = `
    <tr>
        <th>Дата</th>
        <th>Просмотры</th>
        <th>Лайки</th>
        <th>Комментарии</th>
    </tr>
    `;

    const rows = allRows.slice(-50).reverse();

    for (let i = 0; i < rows.length; i++) {

        html += `
        <tr>
            <td>${rows[i][0]}</td>
            <td>${rows[i][1]}</td>
            <td>${rows[i][2]}</td>
            <td>${rows[i][3]}</td>
        </tr>
        `;
    }

    table.innerHTML = html;
}

function showDayStats() {

    const selectedDate =
        document.getElementById("statsDate").value;

    if (!selectedDate) return;

    const dayRows = allRows.filter((row, index) => {

        if (index === 0) return false;

        return row[0].startsWith(selectedDate);
    });

    if (dayRows.length < 2) {

        document.getElementById("dayStats").innerHTML =
            "Нет данных за выбранный день";

        return;
    }

    const first = dayRows[0];
    const last = dayRows[dayRows.length - 1];

    const views =
        Number(last[1]) - Number(first[1]);

    const likes =
        Number(last[2]) - Number(first[2]);

    const comments =
        Number(last[3]) - Number(first[3]);

    document.getElementById("dayStats").innerHTML = `
        <div style="
            background:#1e293b;
            padding:15px;
            border-radius:12px;
            margin-top:10px;
        ">
            <h3>${selectedDate}</h3>

            <p>👁 Просмотры: +${views.toLocaleString()}</p>
            <p>👍 Лайки: +${likes.toLocaleString()}</p>
            <p>💬 Комментарии: +${comments.toLocaleString()}</p>
        </div>
    `;
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

    document.getElementById("viewsPlus").textContent =
    "📈 +" Number(last[4] || 0).toLocaleString();

document.getElementById("likesPlus").textContent =
    "📈 +" Number(last[5] || 0).toLocaleString();

document.getElementById("commentsPlus").textContent =
    "📈 +" Number(last[6] || 0).toLocaleString();

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
