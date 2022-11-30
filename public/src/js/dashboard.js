"use strict";

const toogleButton = document.getElementById("toggle");
const graphLabel = document.getElementById("graph-label");
const todayMetrics = document.getElementById("today-submetrics");
const lastWeekMetrics = document.getElementById("last-week-submetrics");
const lastMonthMetrics = document.getElementById("last-month-submetrics");
const dollarUS = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

async function fetchData() {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken == null) {
    console.log("access token is null");
    window.location.href = "../../index.html";
  }

  await fetch("https://freddy.codesubmit.io/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.msg) {
        console.error("error occured:", data.msg);
        return false;
      } else {
        localStorage.setItem("dashboardData", JSON.stringify(data));
      }
    })
    .catch((data) => {
      console.error("fetch error:", data.msg);
      return false;
    })
    .finally(() => {
      loadBestSellersDataIntoTable();
      displayGraphData();
      displayMetricsData();
    });
}

function loadBestSellersDataIntoTable() {
  const rawData = localStorage.getItem("dashboardData");
  if (rawData === null) {
    return false;
  }
  const data = JSON.parse(rawData);
  const bestsellers = data.dashboard.bestsellers;

  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";

  for (const row of bestsellers) {
    const price = dollarUS.format(row.revenue / row.units);
    const revenue = dollarUS.format(row.revenue);
    const units = Intl.NumberFormat().format(row.units);
    const rowElement = document.createElement("tr");
    const rowData = `<td>${row.product.name}</td>
                    <td>${price}</td>
                    <td>${units}</td>
                    <td>${revenue}</td>`;
    rowElement.innerHTML = rowData;
    tableBody.appendChild(rowElement);
  }
}

function displayGraphData() {
  const isYearlyData = toogleButton.checked;
  const rawData = localStorage.getItem("dashboardData");
  if (rawData === null) {
    return false;
  }
  const parsedData = JSON.parse(rawData);
  let data = isYearlyData
    ? parsedData.dashboard.sales_over_time_year
    : parsedData.dashboard.sales_over_time_week;

  var keys = Object.keys(data);
  var values = Object.values(data);

  var myValues = values.map((item) => item.total);
  var myKeys = keys.map((item) => {
    if (isYearlyData) {
      switch (item) {
        case "1":
          return "this month";
        case "2":
          return "last month";
        default:
          return `month ${item}`;
      }
    } else {
      switch (item) {
        case "1":
          return "today";
        case "2":
          return "yesterday";
        default:
          return `day ${item}`;
      }
    }
  });

  var barColors = [
    "red",
    "green",
    "blue",
    "orange",
    "brown",
    "red",
    "green",
    "blue",
    "orange",
    "brown",
    "blue",
    "orange",
    "brown",
  ];

  let chartStatus = Chart.getChart("myChart");
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }

  graphLabel.innerText = isYearlyData
    ? "Revenue (last 12 months)"
    : "Revenue (last 7 days)";

  new Chart("myChart", {
    type: "bar",
    data: {
      labels: myKeys,
      datasets: [
        {
          backgroundColor: barColors,
          data: myValues,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

function displayMetricsData() {
  const rawData = localStorage.getItem("dashboardData");
  if (rawData === null) {
    return false;
  }
  const parsedData = JSON.parse(rawData);

  var weekObjectValues = Object.values(
    parsedData.dashboard.sales_over_time_week
  );
  var initialWeekOrders = weekObjectValues.reduce((a, b) => a + b.orders, 0);
  var initialWeekTotal = weekObjectValues.reduce((a, b) => a + b.total, 0);

  var todayValues = parsedData.dashboard.sales_over_time_week["1"];
  var todayOrders = todayValues.orders;
  var todayTotal = todayValues.total;
  var lastMonthValues = parsedData.dashboard.sales_over_time_year["2"];
  var lastMonthOrders = lastMonthValues.orders;
  var lastMonthTotal = lastMonthValues.total;
  var lastWeekOrders = initialWeekOrders - todayOrders; //assumption made is that last week is all days - today
  var lastWeekTotals = initialWeekTotal - todayTotal; //assumption made is that last week is all days - today

  var todaySpan = todayMetrics.querySelector("span");
  var lastWeekSpan = lastWeekMetrics.querySelector("span");
  var lastMonthSpan = lastMonthMetrics.querySelector("span");
  todaySpan.innerText = `${dollarUS.format(
    todayTotal
  )} / ${todayOrders} orders`;
  lastMonthSpan.innerText = `${dollarUS.format(
    lastMonthTotal
  )} / ${lastMonthOrders} orders`;
  lastWeekSpan.innerText = `${dollarUS.format(
    lastWeekTotals
  )} / ${lastWeekOrders} orders`;
}

fetchData();

toogleButton.addEventListener("change", (e) => {
  displayGraphData();
});
