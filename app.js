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

function createChart(id, labels, data, title){

    const el = document.getElementById(id);

    const old = echarts.getInstanceByDom(el);

    if(old){
        old.dispose();
    }

    const chart = echarts.init(el);

    chart.setOption({

        tooltip:{
            trigger:"axis"
        },

        dataZoom:[
            {
                type:"inside"
            },
            {
                type:"slider"
            }
        ],

        xAxis:{
            type:"category",
            data:labels
        },

        yAxis:{
            type:"value",
            scale:true
        },

        series:[
            {
                name:title,
                type:"line",
                smooth:false,
                showSymbol:true,
                symbolSize:4,
                data:data
            }
        ]
    });

}

function renderCharts(){

    const labels = [];

    const views = [];
    const likes = [];
    const comments = [];

    for(let i=1;i<allRows.length;i++){

        labels.push(allRows[i][0]);

        if(currentMode === "total"){

            views.push(Number(allRows[i][1]) || 0);
            likes.push(Number(allRows[i][2]) || 0);
            comments.push(Number(allRows[i][3]) || 0);

        }else{

            views.push(Number(allRows[i][4]) || 0);
            likes.push(Number(allRows[i][5]) || 0);
            comments.push(Number(allRows[i][6]) || 0);
        }
    }

    createChart(
        "viewsChart",
        labels,
        views,
        "Просмотры"
    );

    createChart(
        "likesChart",
        labels,
        likes,
        "Лайки"
    );

    createChart(
        "commentsChart",
        labels,
        comments,
        "Комментарии"
    );
}

function switchMode(mode){

    currentMode = mode;
    renderCharts();
}

async function updateData(){

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
        "📈 +" + Number(last[4] || 0).toLocaleString();

    document.getElementById("likesPlus").textContent =
        "📈 +" + Number(last[5] || 0).toLocaleString();

    document.getElementById("commentsPlus").textContent =
        "📈 +" + Number(last[6] || 0).toLocaleString();

    renderCharts();
}

async function init(){

    await updateData();
}

init();

setInterval(updateData, 60000);
