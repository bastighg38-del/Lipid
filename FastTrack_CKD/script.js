// =========================
// SEITE EINBLENDEN
// =========================

function berechneCKDStadium(eGFR, acr) {
  let G;
  let A;
  let risiko;
  let beschreibung;

  if (eGFR >= 90) {
    G = "G1";
    beschreibung = "normale bis erhöhte (Hyperfiltration)";
  } else if (eGFR >= 60) {
    G = "G2";
    beschreibung = "mild eingeschränkte bis normal";
  } else if (eGFR >= 45) {
    G = "G3a";
    beschreibung = "mild bis mittelschwer eingeschränkte";
  } else if (eGFR >= 30) {
    G = "G3b";
    beschreibung = "schwer bis mittelschwer eingeschränkte";
  } else if (eGFR >= 15) {
    G = "G4";
    beschreibung = "schwer eingeschränkte";
  } else {
    G = "G5";
    beschreibung = "Nierenversagen";
  }

  if (acr < 30) {
    A = "A1";
  } else if (acr < 300) {
    A = "A2";
  } else {
    A = "A3";
  }

  const risikoTabelle = {
    G1: { A1: 1, A2: 1, A3: 2 },
    G2: { A1: 1, A2: 1, A3: 2 },
    G3a: { A1: 1, A2: 2, A3: 3 },
    G3b: { A1: 2, A2: 3, A3: 3 },
    G4: { A1: 3, A2: 3, A3: "4+" },
    G5: { A1: "4+", A2: "4+", A3: "4+" },
  };

  risiko = risikoTabelle[G][A];

  return { G, A, risiko, beschreibung };
}

window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});

// =========================
// SWEETALERT2 POPUP
// =========================
function showPopup(title, text, icon = "info") {
  if (typeof Swal === "undefined") return; // SweetAlert nicht geladen – ignorieren
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "OK",
    confirmButtonColor: "#2563eb",
    background: "#fff",
    color: "#1f2937",
    allowOutsideClick: true,
    allowEscapeKey: true,
  });
}

// =========================
// LOCAL STORAGE – ZWEI GETRENNTE SCHLÜSSEL
// =========================
const CKD_STORAGE_KEY = "ckdCalculatorData";
const NEPHRO_STORAGE_KEY = "nephroFormData";

// =========================
// HILFSFUNKTION
// =========================
function getElementSafe(selector) {
  return document.querySelector(selector);
}

// =========================
// CKD – INITIALISIERUNG NUR, WENN CKD-ELEMENTE VORHANDEN
// =========================
function initCKD() {
  // Prüfen, ob CKD-spezifische Elemente vorhanden sind
  const dropdownElement = getElementSafe(".custom-dropdown");
  const ageInput = document.getElementById("age");
  if (!dropdownElement && !ageInput) {
    return; // Kein CKD-Teil auf dieser Seite
  }

  // ----- Dropdown -----
  const dropdown = dropdownElement;
  let button, menu, options, selectedOption, arrow;
  let selectedGender = null;

  if (dropdown) {
    button = dropdown.querySelector(".dropdown-button");
    menu = dropdown.querySelector(".dropdown-menu");
    options = dropdown.querySelectorAll(".dropdown-option");
    selectedOption = dropdown.querySelector(".selected-option");
    arrow = dropdown.querySelector(".arrow");
  }

  // ----- CKD Speichern / Laden -----
  function saveCKDData() {
    const data = {
      age: document.getElementById("age")?.value || "",
      creatinine: document.getElementById("creatinine")?.value || "",
      acr: document.getElementById("acr")?.value || "",
      selectedGender: selectedGender,
      genderText: selectedOption ? selectedOption.textContent : "",
      egfr: document.getElementById("egfr-result")?.value || "",
      risk2: document.getElementById("risk2")?.textContent || "—",
      risk5: document.getElementById("risk5")?.textContent || "—",
    };
    localStorage.setItem(CKD_STORAGE_KEY, JSON.stringify(data));
  }

  function loadCKDData() {
    const savedData = localStorage.getItem(CKD_STORAGE_KEY);
    if (!savedData) return;
    const data = JSON.parse(savedData);

    if (document.getElementById("age"))
      document.getElementById("age").value = data.age || "";
    if (document.getElementById("creatinine"))
      document.getElementById("creatinine").value = data.creatinine || "";
    if (document.getElementById("acr"))
      document.getElementById("acr").value = data.acr || "";

    if (
      data.selectedGender !== null &&
      data.selectedGender !== undefined &&
      selectedOption
    ) {
      selectedGender = Number(data.selectedGender);
      selectedOption.textContent = data.genderText || "Option auswählen";
    }

    if (document.getElementById("egfr-result"))
      document.getElementById("egfr-result").value = data.egfr || "";
    if (document.getElementById("risk2"))
      document.getElementById("risk2").textContent = data.risk2 || "—";
    if (document.getElementById("risk5"))
      document.getElementById("risk5").textContent = data.risk5 || "—";
  }

  // ----- Dropdown Events -----
  if (button && menu && arrow) {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      menu.classList.toggle("active");
      arrow.classList.toggle("rotate");
    });
  }

  if (options) {
    options.forEach((option) => {
      option.addEventListener("click", () => {
        if (!selectedOption) return;
        selectedOption.textContent = option.textContent.trim();
        selectedGender = Number(option.dataset.value);
        if (menu) menu.classList.remove("active");
        if (arrow) arrow.classList.remove("rotate");
        saveCKDData();
      });
    });
  }

  document.addEventListener("click", () => {
    if (menu) menu.classList.remove("active");
    if (arrow) arrow.classList.remove("rotate");
  });

  // ----- CKD Berechnung -----
  function calculateCKDEPI2021(age, male, creatinine) {
    let kappa, alpha;
    if (male === 1) {
      kappa = 0.9;
      alpha = -0.302;
    } else {
      kappa = 0.7;
      alpha = -0.241;
    }

    const creatinineRatio = creatinine / kappa;
    const minValue = Math.min(creatinineRatio, 1);
    const maxValue = Math.max(creatinineRatio, 1);

    let egfr =
      142 *
      Math.pow(minValue, alpha) *
      Math.pow(maxValue, -1.2) *
      Math.pow(0.9938, age);

    if (male === 0) {
      egfr *= 1.012;
    }

    return egfr;
  }

  function kfre(age, male, egfr, acr) {
    const lp =
      -0.2201 * (age / 10 - 7.036) +
      0.2467 * (male - 0.5642) -
      0.5567 * (egfr / 5 - 7.222) +
      0.451 * (Math.log(acr) - 5.137);

    const risk2 = 1 - Math.pow(0.9832, Math.exp(lp));
    const risk5 = 1 - Math.pow(0.9365, Math.exp(lp));

    return { risk2: risk2 * 100, risk5: risk5 * 100 };
  }

  const calculateButton = document.getElementById("calculate-button");
  if (calculateButton) {
    calculateButton.addEventListener("click", () => {
      let risikoBerechnen = true;

      const age = Number(document.getElementById("age")?.value);
      const creatinine = Number(document.getElementById("creatinine")?.value);
      const acr = Number(document.getElementById("acr")?.value);

      if (!age || creatinine <= 0 || acr <= 0 || selectedGender === null) {
        showPopup(
          "Fehlende Eingaben",
          "Bitte alle Werte eingeben und ein Geschlecht auswählen.",
          "warning",
        );
        return;
      }

      if (age < 18) {
        showPopup(
          "Berechnung nicht möglich",
          "Die Risikoabschätzung ist nur für Personen ab 18 Jahren validiert.",
          "error",
        );
        if (document.getElementById("egfr-result"))
          document.getElementById("egfr-result").value = "-";
        if (document.getElementById("risk2"))
          document.getElementById("risk2").textContent = "—";
        if (document.getElementById("risk5"))
          document.getElementById("risk5").textContent = "—";
        saveCKDData();
        risikoBerechnen = false;
      }

      const egfr = calculateCKDEPI2021(age, selectedGender, creatinine);
      if (document.getElementById("egfr-result"))
        document.getElementById("egfr-result").value = egfr.toFixed(1);

      if (age > 99) {
        showPopup(
          "Berechnung nicht möglich",
          "Eine Risikoabschätzung ist bei Menschen über 99 Jahre nicht möglich.",
          "error",
        );
        if (document.getElementById("risk2"))
          document.getElementById("risk2").textContent = "—";
        if (document.getElementById("risk5"))
          document.getElementById("risk5").textContent = "—";
        saveCKDData();
        risikoBerechnen = false;
      }

      if (egfr < 10) {
        showPopup(
          "Berechnung nicht möglich",
          "Bei einer eGFR unter 10 ml/min liegt im Regelfall bereits nierenersatztherapiepflichtiges Nierenversagen vor. Eine Risikoabschätzung ist daher nicht sinnvoll.",
          "error",
        );
        if (document.getElementById("risk2"))
          document.getElementById("risk2").textContent = "—";
        if (document.getElementById("risk5"))
          document.getElementById("risk5").textContent = "—";
        saveCKDData();
        risikoBerechnen = false;
      }

      if (egfr >= 61) {
        showPopup(
          "Berechnung nicht möglich",
          "Der Risikokalkulator ist nur für eine eGFR unter 61 ml/min validiert. Eine Schätzung ist daher nicht möglich.",
          "error",
        );
        if (document.getElementById("risk2"))
          document.getElementById("risk2").textContent = "—";
        if (document.getElementById("risk5"))
          document.getElementById("risk5").textContent = "—";
        saveCKDData();
        risikoBerechnen = false;
      }

      const result = kfre(age, selectedGender, egfr, acr);

      if (risikoBerechnen) {
        if (document.getElementById("risk2"))
          document.getElementById("risk2").textContent =
            result.risk2.toFixed(0) + "%";
        if (document.getElementById("risk5"))
          document.getElementById("risk5").textContent =
            result.risk5.toFixed(0) + "%";
        saveCKDData();
      }

      let output = document.getElementById("Resulttext");
      if (!output) return;
      output.innerHTML = "";

      let outputText = "";

      const ckdErgebnis = berechneCKDStadium(egfr, acr);
      const G = ckdErgebnis.G;
      const A = ckdErgebnis.A;
      const risiko = ckdErgebnis.risiko;
      const beschreibung = ckdErgebnis.beschreibung;

      if (selectedGender === 1) {
        outputText +=
          "Der Patient stellte sich zur Beurteilung der Nierenfunktion vor.<br>";
      } else {
        outputText +=
          "Die Patientin stellte sich zur Beurteilung der Nierenfunktion vor.<br>";
      }

      outputText += `
        <p>Folgende Laborwerte wurden zur Verfügung gestellt:</p>
        <ul>
          <li>Kreatinin: ${creatinine} mg/dl</li>
          <li>eGFR (CKD-EPI): ${egfr.toFixed(1)} ml/min/1,73 m²</li>
          <li>UACR: ${acr} mg/g Kreatinin</li>
        </ul>
      `;

      outputText += `
        <p>
          Es liegt eine <strong>${beschreibung}</strong> Nierenfunktion im Stadium
          <strong>${G}${A}</strong> nach KDIGO vor.
        </p>
      `;

      if (egfr > 60) {
        outputText +=
          "<p>Spezifische Nephrologische Maßnahmen sind nicht erforderlich. Eine erneute Vorstellung wird in folgenden Situationen empfohlen: Anstieg des Kreatinins über 2 mg/dl, Entwicklung einer Albuminurie von über 1g/mg Kreatinin.</p>";
      }

      if (risikoBerechnen) {
        if (result.risk5 <= 5) {
          outputText += `<p>Spezifische Nephrologische Maßnahmen sind nicht erforderlich. Eine erneute Vorstellung wird in folgenden Situationen empfohlen: Anstieg des Kreatinins über 2 mg/dl oder Entwicklung einer Albuminurie von über 1 g/mg Kreatinin.</p>`;
        } else if (result.risk5 <= 15) {
          outputText += `<p>Es liegt eine Nierenfunktionsstörung vor. Eine typische CKD-Progression ist zu erwarten. Im Vordergrund steht die Kontrolle der kardiovaskulären Risikofaktoren. Jährliche Kontrollen bei uns sind empfohlen.</p><p>Wenn UACR > 30) Ein ACE-Hemmer und ein SGLT2-Inhibitor sollten Bestandteil der Therapie sein.</p>`;
        } else if (result.risk5 <= 40) {
          outputText += `<p>Es liegt eine Nierenfunktionsstörung vor. Der Patient wird in unser Programm bei chronischer Niereninsuffizienz aufgenommen und erweiterte Diagnostik durchgeführt. Wir werden erneut berichten.</p><p>Eine Verlaufskontrolle erfolgt in 6 Monaten.</p>`;
        } else if (result.risk5 > 40) {
          outputText += `<p>Es liegt eine Nierenfunktionsstörung vor. Der Patient wird in unser Programm bei chronischer Niereninsuffizienz aufgenommen. Wir werden erneut berichten.</p><p>Eine Verlaufskontrolle erfolgt in 3 Monaten.</p>`;
        }
      }

      output.innerHTML = outputText;
    });
  }

  // ----- CKD Inputs automatisch speichern (nur die vorhandenen) -----
  const ckdInputIds = ["age", "creatinine", "acr"];
  ckdInputIds.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", saveCKDData);
    }
  });

  // ----- CKD Reset -----
  const resetButton = document.getElementById("resetBtn");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      localStorage.removeItem(CKD_STORAGE_KEY);
      if (document.getElementById("age"))
        document.getElementById("age").value = "";
      if (document.getElementById("creatinine"))
        document.getElementById("creatinine").value = "";
      if (document.getElementById("acr"))
        document.getElementById("acr").value = "";
      selectedGender = null;
      if (selectedOption) selectedOption.textContent = "Option auswählen";
      if (document.getElementById("egfr-result"))
        document.getElementById("egfr-result").value = "";
      if (document.getElementById("risk2"))
        document.getElementById("risk2").textContent = "—";
      if (document.getElementById("risk5"))
        document.getElementById("risk5").textContent = "—";
    });
  }

  // ----- CKD Daten laden -----
  loadCKDData();
}

// =========================
// NEPHRO – INITIALISIERUNG NUR, WENN NEPHRO-ELEMENTE VORHANDEN
// =========================
function initNephro() {
  // Prüfen, ob mindestens eine Nephro-Checkbox existiert
  const firstCheckbox = document.getElementById("option1");
  if (!firstCheckbox) {
    return; // Kein Nephro-Teil
  }

  function saveNephroData() {
    const data = {
      option1: document.getElementById("option1")?.checked || false,
      option2: document.getElementById("option2")?.checked || false,
      option3: document.getElementById("option3")?.checked || false,
      option4: document.getElementById("option4")?.checked || false,
      option5: document.getElementById("option5")?.checked || false,
      option6: document.getElementById("option6")?.checked || false,
      jahrblut: document.getElementById("jahrblut")?.value || "",
      obererWert: document.getElementById("obererWert")?.value || "",
    };
    localStorage.setItem(NEPHRO_STORAGE_KEY, JSON.stringify(data));
  }

  function loadNephroData() {
    const savedData = localStorage.getItem(NEPHRO_STORAGE_KEY);
    if (!savedData) return;
    const data = JSON.parse(savedData);

    if (document.getElementById("option1"))
      document.getElementById("option1").checked = data.option1 || false;
    if (document.getElementById("option2"))
      document.getElementById("option2").checked = data.option2 || false;
    if (document.getElementById("option3"))
      document.getElementById("option3").checked = data.option3 || false;
    if (document.getElementById("option4"))
      document.getElementById("option4").checked = data.option4 || false;
    if (document.getElementById("option5"))
      document.getElementById("option5").checked = data.option5 || false;
    if (document.getElementById("option6"))
      document.getElementById("option6").checked = data.option6 || false;
    if (document.getElementById("jahrblut"))
      document.getElementById("jahrblut").value = data.jahrblut || "";
    if (document.getElementById("obererWert"))
      document.getElementById("obererWert").value = data.obererWert || "";
  }

  // ----- Nephro-Inputs automatisch speichern -----
  const nephroInputIds = [
    "option1",
    "option2",
    "option3",
    "option4",
    "option5",
    "option6",
    "jahrblut",
    "obererWert",
  ];
  nephroInputIds.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", saveNephroData);
      input.addEventListener("change", saveNephroData); // für Checkboxen
    }
  });

  loadNephroData();
}

// =========================
// INITIALISIERUNG BEIDER TEILE
// =========================
initCKD();
initNephro();
