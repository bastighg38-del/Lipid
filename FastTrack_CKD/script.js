// Seite einblenden

window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});

// =========================
// DROPDOWN
// =========================

const dropdown = document.querySelector(".custom-dropdown");

const button = dropdown.querySelector(".dropdown-button");

const menu = dropdown.querySelector(".dropdown-menu");

const options = dropdown.querySelectorAll(".dropdown-option");

const selectedOption = dropdown.querySelector(".selected-option");

const arrow = dropdown.querySelector(".arrow");

let selectedGender = null;

// Dropdown öffnen / schließen

button.addEventListener("click", (event) => {
  event.stopPropagation();

  menu.classList.toggle("active");

  arrow.classList.toggle("rotate");
});

// Option auswählen

options.forEach((option) => {
  option.addEventListener("click", () => {
    selectedOption.textContent = option.textContent.trim();

    selectedGender = Number(option.dataset.value);

    menu.classList.remove("active");

    arrow.classList.remove("rotate");
  });
});

// Dropdown schließen

document.addEventListener("click", () => {
  menu.classList.remove("active");

  arrow.classList.remove("rotate");
});

// =========================
// KFRE
// =========================

function kfre(age, male, egfr, acr) {
  const lp =
    -0.2201 * (age / 10 - 7.036) +
    0.2467 * (male - 0.5642) -
    0.5567 * (egfr / 5 - 7.222) +
    0.451 * (Math.log(acr) - 5.137);

  const risk2 = 1 - Math.pow(0.9832, Math.exp(lp));

  const risk5 = 1 - Math.pow(0.9365, Math.exp(lp));

  return {
    risk2: risk2 * 100,

    risk5: risk5 * 100,
  };
}

// =========================
// BERECHNUNG
// =========================

document.getElementById("calculate-button").addEventListener("click", () => {
  const age = Number(document.getElementById("age").value);

  const egfr = Number(document.getElementById("egfr").value);

  const acr = Number(document.getElementById("acr").value);

  if (age <= 0 || egfr <= 0 || acr <= 0 || selectedGender === null) {
    alert("Bitte alle Werte eingeben und ein Geschlecht auswählen.");

    return;
  }

  const result = kfre(age, selectedGender, egfr, acr);

  document.getElementById("risk2").textContent = result.risk2.toFixed(1) + "%";

  document.getElementById("risk5").textContent = result.risk5.toFixed(1) + "%";
});
