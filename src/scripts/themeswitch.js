const themeBtn = document.querySelector(".theme-toggle");

// BETÖLTÉS
(function initTheme(){
  const saved = localStorage.getItem("theme");

  if(saved === "light"){
    document.body.classList.add("light");
    themeBtn.textContent = "☀️";
  } else {
    themeBtn.textContent = "🌙";
  }
})();

// TOGGLE
function toggleTheme(){
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");

  if(isLight){
    localStorage.setItem("theme", "light");
    themeBtn.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "dark");
    themeBtn.textContent = "🌙";
  }
}
