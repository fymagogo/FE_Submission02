"use strict";

const refreshButton = document.getElementById("refresh");
const logoutButton = document.getElementById("logout");

function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken == null) {
    window.location.href = "../../index.html";
  }
  fetch("https://freddy.codesubmit.io/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.access_token) {
        localStorage.setItem("accessToken", data.access_token);
      } else {
        console.error("refresh error:", data.msg);
        logOut();
      }
    })
    .catch((data) => {
      console.error("refresh error:", data.msg);
      logOut();
    });
}

function logOut() {
  localStorage.clear();
  window.location.href = "./index.html";
}

refreshToken();

const navbar = document.querySelector(".sidenav").querySelectorAll("a");
navbar.forEach((item) => {
  item.addEventListener("click", function () {
    hamburger.forEach((e) => e.classList.remove("active"));
    item.classList.toggle("active");
  });
});
