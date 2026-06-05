const CSV_URL =
"https://docs.google.com/spreadsheets/u/0/d/1nlZSMyDzCxI8k6CkhG66B4uRjz7zrwT3VpCzJJPO7Dc/export?format=csv";

async function loadData() {

    const response = await fetch(CSV_URL);
    const csv = await response.text();

    return csv
        .trim()
        .split("\n")
        .map(row => row.split(","));
}

async function init() {

    const rows = await loadData();

    const last = rows[rows.length - 1];

    document.getElementById("views").textContent =
        Number(last[1]).toLocaleString();

    document.getElementById("likes").textContent =
        Number(last[2]).toLocaleString();

    document.getElementById("comments").textContent =
        Number(last[3]).toLocaleString();

    const labels = [];
    const viewsData = [];

    for(let i = 1; i < rows.length; i++) {

        labels.push(rows[i][0]);

        viewsData.push(
            Number(rows[i][1])
        );
    }

    const chart = echarts.init(
        document.getElementById("viewsChart")
    );

    chart.setOption({

        tooltip:{
            trigger:"axis"
        },

        xAxis:{
            type:"category",
            data:labels
        },

        yAxis:{
            type:"value"
        },

        series:[
            {
                name:"Просмотры",
                type:"line",
                smooth:true,
                data:viewsData
            }
        ]
    });

}

init();
