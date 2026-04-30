function initSearch({ inputId, noResultId, mode }) {
  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById(inputId);
    const noResult = document.getElementById(noResultId);

    if (!input) {
      console.warn("Search input not found:", inputId);
      return;
    }

    input.addEventListener("input", runSearch);

    function runSearch() {
      const val = input.value.toLowerCase().trim();
      let found = false;

      let elements = [];
      let getText;
      let getHighlightTargets;


      switch (mode) {
         // ===== SETTINGS PAGE =====
        case "settings":
          elements = document.querySelectorAll(".container.settings");
          getText = el => el.innerText.toLowerCase();
          getHighlightTargets = el =>
            el.querySelectorAll(".level-1-title, .level-2, .level-3, span");
          break;

        // ===== RULES PAGE =====
        case "rules":
          elements = document.querySelectorAll(".level-1, .level-2, .level-3");
          getText = el => el.innerText.toLowerCase();
          getHighlightTargets = el => el.querySelectorAll(".level-text, .level-1-title, .level-2-title, .level-3-title");
          break;

        // ===== TABLE PAGE =====
        case "table":
          elements = document.querySelectorAll("#tbody tr");
          //getText = el => el.innerText.toLowerCase();
          //  getText = el => el.querySelector(".name").innerText.toLowerCase();     // Csak névre
          //getHighlightTargets = el => el.querySelectorAll("td");
          //  getHighlightTargets = el => [el.querySelector(".name")];

          // csak név alapján keres
          getText = el => {
            const nameEl = el.querySelector(".name");
            return nameEl ? nameEl.innerText.toLowerCase() : "";
          };

          // csak name cellát highlightoljuk
          getHighlightTargets = el => {
            const nameEl = el.querySelector(".name");
            return nameEl ? [nameEl] : [];
          };

          break;

        // ===== SIMPLE LIST =====
        case "list":
          elements = document.querySelectorAll(".search-item");
          getText = el => el.innerText.toLowerCase();
          getChildren = el => [el];
          break;

        // ==== HIBA ====
        default:
          console.warn("Unknown search mode:", mode);
          return;
      }

      // =========================
      // ORIGINAL HTML SAVE
      // =========================
      elements.forEach(el => {
        getHighlightTargets(el).forEach(child => {
          if (!child.dataset.original) {
            child.dataset.original = child.innerHTML;
          }
        });
      });

      
      // =========================
      // RESET
      // =========================
      elements.forEach(el => {
        el.style.display = "";

        getHighlightTargets(el).forEach(child => {
          child.innerHTML = child.dataset.original;
        });
      });


      if (val === "") {
        if (noResult) noResult.style.display = "none";
        return;
      }

      // =========================
      // SEARCH
      // =========================
      elements.forEach(el => {
        const text = getText(el);

        if (text.includes(val)) {
          found = true;

          getHighlightTargets(el).forEach(child => {
            highlightPreserveHTML(child, val);
          });

        } else {
          el.style.display = "none";
        }
      });

      if (noResult) {
        noResult.style.display = found ? "none" : "block";
      }
    }

    // =========================
    // HIGHLIGHT (HTML SAFE)
    // =========================
    function highlightPreserveHTML(element, search) {
      const regex = new RegExp(`(${search})`, "gi");

      element.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const span = document.createElement("span");
          span.innerHTML = node.textContent.replace(regex, `<span class="highlight">$1</span>`);
          node.replaceWith(span);
        }
      });
    }
    
    // ===== CTRL + F OVERRIDE =====
    document.addEventListener("keydown", e => {
      if (e.ctrlKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        input.focus();
      }
    });

  });
}
