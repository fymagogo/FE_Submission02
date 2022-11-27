"use strict";

function fetchData() {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken == null) {
    console.log("case");
    //window.location.href = "./index.html";
  }

  fetch("https://freddy.codesubmit.io/dashboard", {
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
      } else {
        loadDataIntoTable(data);
        displayGraphData(data);
      }
    })
    .catch((data) => {
      console.error("refresh error:", data.msg);
      //logOut();
    });
}

function loadDataIntoTable(data) {
  const bestsellers = data.dashboard.bestsellers;

  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";

  for (const row of bestsellers) {
    const price = row.revenue / row.units;
    const rowElement = document.createElement("tr");
    const rowData = `<td>${row.product.name}</td>
                    <td>${price}</td>
                    <td>${row.units}</td>
                    <td>${row.revenue}</td>`;
    rowElement.innerHTML = rowData;
    tableBody.appendChild(rowElement);
  }
}

function displayGraphData(dataSent) {
  const fish = dataSent.dashboard.sales_over_time_week;
  var keys = Object.keys(fish);
  var values = Object.values(fish);

  var myValues = values.map((item) => item.total);

  var xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
  var yValues = [55, 49, 44, 24, 15];
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
  ];

  //use array.sort to place in order
  //use map on keys to return labels in order.. use index 0 and 1 for first 2 keys
  //place dashboard data in session to toggle graph data

  new Chart("myChart", {
    type: "bar",
    data: {
      labels: keys,
      datasets: [
        {
          backgroundColor: barColors,
          data: myValues,
        },
      ],
    },
  });
}

fetchData();
//displayGraphData();
