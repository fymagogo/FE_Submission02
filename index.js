"use strict";

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  const username = loginForm.username.value;
  const password = loginForm.password.value;

  fetch("https://freddy.codesubmit.io/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.msg) {
        loginErrorMsg.innerText = data.msg;
        return false;
      } else if (data.access_token && data.refresh_token) {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        window.location.href = "./src/pages/dashboard.html";
      } else {
        loginErrorMsg.innerText = "An error occured with the response";
        return false;
      }
    })
    .catch((data) => {
      console.log(data.error);
      loginErrorMsg.innerText = "An error occured";
    });
});

function checkIfLoggedIn() {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken === null) {
    window.location.href = "./index.html";
  }
}

//checkIfLoggedIn();
