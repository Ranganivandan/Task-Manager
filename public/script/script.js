document.getElementById("show-signin").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("signup-container").style.display = "none";
  document.getElementById("signin-container").style.display = "block";
});

document.getElementById("show-signup").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("signin-container").style.display = "none";
  document.getElementById("signup-container").style.display = "block";
});
