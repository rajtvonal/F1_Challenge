function goBack(){ window.location.href = "../"; }

// SZABÁLYZAT BETÖLTÉSE
fetch("rules.txt")
  .then(res => res.text())
  .then(text => generateRules(text));

function generateRules(text){
  const container = document.querySelector(".container");
  container.innerHTML = "";

  const lines = text.split("\n");

  let currentL1 = null;
  let currentL2 = null;
  let currentL3 = null;

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    if(line === "") return;

    // --- LEVEL 1 ---
    if(/^\d+\.\s/.test(line)){
      currentL1 = createDiv("level-1");
      currentL1.innerHTML = `
        <div class="level-1-title">${line}</div>
      `;
      container.appendChild(currentL1);

      currentL2 = null;
      currentL3 = null;
      return;
    }

    // --- LEVEL 2 ---
    if(/^\d+\.\d+\s/.test(line)){
      if(!currentL1) return;

      currentL2 = createDiv("level-2");
      currentL2.innerHTML = `
        <div class="level-2-title">${line}</div>
      `;
      currentL1.appendChild(currentL2);

      currentL3 = null;
      return;
    }

    // --- LEVEL 3 ---
    if(/^\d+\.\d+\.\d+$/.test(line)){
      if(!currentL2) return;

      currentL3 = createDiv("level-3");
      currentL3.innerHTML = `
        <div class="level-3-title">${line}</div>
      `;
      currentL2.appendChild(currentL3);
      return;
    }

    // --- SIMA SZÖVEG ---
    const textDiv = `<div class="level-text">${line}</div>`;

    if(currentL3){
      currentL3.innerHTML += textDiv;
    } else if(currentL2){
      currentL2.innerHTML += textDiv;
    } else if(currentL1){
      currentL1.innerHTML += textDiv;
    }
  });
}

function createDiv(className){
  const div = document.createElement("div");
  div.className = className;
  return div;
}

// SEARCH BOX
const input = document.getElementById("search");
const noResult = document.getElementById("noResult");

input.addEventListener("input", function(){
  const val = this.value.toLowerCase().trim();
  let found = false;

  const allBlocks = document.querySelectorAll(".level-1, .level-2, .level-3");

  // RESET
  document.querySelectorAll(".level-text, .level-1-title, .level-2-title, .level-3-title")
    .forEach(el => {
      el.innerHTML = el.innerText;
    });

  allBlocks.forEach(b => b.style.display = "block");

  if(val === ""){
    noResult.style.display = "none";
    return;
  }

  allBlocks.forEach(block => {
    const text = block.innerText.toLowerCase();

    if(text.includes(val)){
      found = true;

      // highlight
      block.querySelectorAll(".level-text, .level-1-title, .level-2-title, .level-3-title")
        .forEach(el => {
          const original = el.innerText;
          const regex = new RegExp(`(${val})`, "gi");
          el.innerHTML = original.replace(regex, `<span class="highlight">$1</span>`);
        });

    } else {
      block.style.display = "none";
    }
  });

  noResult.style.display = found ? "none" : "block";
});

// Ctrl+F override
document.addEventListener("keydown", e=>{
  if(e.ctrlKey && e.key === "f"){
    e.preventDefault();
    input.focus();
  }
});
