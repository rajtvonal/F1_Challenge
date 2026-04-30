// SZABÁLYZAT BETÖLTÉSE
fetch("../database/F1/rules.txt")
  .then(res => res.text())
  .then(text => generateRules(text));

function generateRules(text){
  const container = document.querySelector(".container.rule");
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


