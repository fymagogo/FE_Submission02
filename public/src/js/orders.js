"use strict";

let index = 0;
let pages = [];
let currentPage = 1;
let numberOfPages = 1;
let totalCount = 0;
let query = "";
let orders = [];
const btnContainer = document.querySelector(".btn-container");
const loaderContainer = document.querySelector(".loader-container");
const loadingDiv = document.getElementById("loading");

function displayLoading() {
  loaderContainer.style.display = "block";
  //loadingDiv.style.display = "block";
}

function hideLoading() {
  loaderContainer.style.display = "none";
  //loadingDiv.style.display = "none";
}

async function fetchData(page = currentPage, q = query) {
  displayLoading();
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
        currentPage = data.page;
        totalCount = data.total;
        orders = data.orders;
        return data.orders;
      }
    })
    .catch((data) => {
      console.error("fetch error:", data.msg);
      return false;
    })
    .finally(() => {
      // hideLoading();
    });
}

function capitalizeFirstLetter(word) {
  const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
  return capitalized;
}

function loadOrdersDataIntoTable() {
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
    hideLoading();
  }
}

const displayButtons = () => {
  const itemsPerPage = 50;
  numberOfPages = Math.ceil(totalCount / itemsPerPage);
  const btns = [];
  for (let i = 0; i < numberOfPages; i++) {
    const btn = `<button class="page-btn ${
      index === i ? "active-btn" : "null "
    }" data-index="${i}">
      ${i + 1}
      </button>`;
    btns.push(btn);
  }
  btns.push(`<button class="next-btn">next</button>`);
  btns.unshift(`<button class="prev-btn">prev</button>`);
  btnContainer.innerHTML = btns.join("");
};

const setupUI = () => {
  loadOrdersDataIntoTable();
  displayButtons();
};

const init = async () => {
  await fetchData();
  setupUI();
};

btnContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-container")) return;
  if (e.target.classList.contains("page-btn")) {
    index = parseInt(e.target.dataset.index);
    currentPage = parseInt(e.target.dataset.index) + 1;
  }
  if (e.target.classList.contains("next-btn")) {
    index++;
    currentPage++;
    if (index > numberOfPages - 1) {
      index = numberOfPages - 1;
      currentPage = numberOfPages;
    }
  }
  if (e.target.classList.contains("prev-btn")) {
    index--;
    currentPage--;
    if (index < 0) {
      index = 0;
      currentPage = 1;
    }
  }
  init();
});

// Get the input field
const search = document.getElementById("search");

// Execute a function when the user presses a key on the keyboard
search.addEventListener("keypress", async function (event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    event.preventDefault();
    query = event.target.value;
    index = 0;
    currentPage = 1;
    init();
  }
});

init();
