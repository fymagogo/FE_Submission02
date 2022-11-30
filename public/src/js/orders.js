"use strict";

async function fetchData(page = 1, q = "") {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken == null) {
    console.log("access token is null");
    window.location.href = "../../index.html";
  }

  await fetch(`https://freddy.codesubmit.io/orders?page=${page}&q=${q}`, {
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
        localStorage.setItem("OrdersData", JSON.stringify(data));
      }
    })
    .catch((data) => {
      console.error("fetch error:", data.msg);
      return false;
    })
    .finally(() => {
      loadOrdersDataIntoTable();
    });
}

function capitalizeFirstLetter(word) {
  const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
  return capitalized;
}

function loadOrdersDataIntoTable() {
  const rawData = localStorage.getItem("OrdersData");
  if (rawData === null) {
    return false;
  }
  const data = JSON.parse(rawData);
  const orders = data.orders;
  const page = data.page;
  const total = data.total;

  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";

  for (const row of orders) {
    const price = (row.total / row.product.quantity).toFixed(2);
    const date = new Date(row.created_at).toLocaleDateString();
    const statusColor =
      row.status.toLowerCase() === "delivered"
        ? "green"
        : row.status.toLowerCase() === "processing"
        ? "red"
        : "black";

    const rowElement = document.createElement("tr");
    const rowData = `<td>${row.product.name}</td>
                    <td>${date}</td>
                    <td>${row.currency}${price}</td>
                    <td style="color:${statusColor};">${capitalizeFirstLetter(
      row.status
    )}</td>`;
    rowElement.innerHTML = rowData;
    tableBody.appendChild(rowElement);
  }
}

// Get the input field
const search = document.getElementById("search");

// Execute a function when the user presses a key on the keyboard
search.addEventListener("keypress", async function (event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    event.preventDefault();
    const query = event.target.value;
    await fetchData(undefined, query);
  }
});

fetchData();

// toogleButton.addEventListener("change", (e) => {
//   displayGraphData();
// });
