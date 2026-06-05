const CSV_URL =
  "https://docs.google.com/spreadsheets/u/0/d/1nlZSMyDzCxI8k6CkhG66B4uRjz7zrwT3VpCzJJPO7Dc/export?format=csv";

async function loadData() {
  const response = await fetch(CSV_URL);
  const csv = await response.text();

  const rows = csv
    .trim()
    .split("\n")
    .map(row => row.split(","));

  return rows;
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
}

init();
