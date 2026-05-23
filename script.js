



// ================== Faktoren ==================


const factor1 = 0.026;
const factor2 = 0.0114;
const factor3 = 88.4;
const factor4 = 0.026;
const factor5 = 0.026;
const factor6 = 0.0195;
const factor7 = 2.4;
const factor8 = 10.929;


// ================== Helper ==================
const get = id => document.getElementById(id);

// ================== Inputs ==================
const inputs = {};
for (let i = 1; i <= 36; i++) {
    inputs[i] = get(`${i}Input`);
}

// ================== SAVE ==================
function saveInput(input) {
    if (!input || !input.id) return;
    const num = parseInt(input.id, 10);
    if (num % 2 === 1) {
        localStorage.setItem(input.id, input.value);
    }
}

// ================== RESET ==================
const resetBtn = get("resetBtn");
resetBtn?.addEventListener("click", () => {
    document.querySelectorAll("input").forEach(i => i.value = "");
    localStorage.clear();
    updateAllCalculated();
});

// ================== CLICK → FOCUS ==================
document.querySelectorAll('.eingabefeld').forEach(feld => {
    feld.addEventListener('click', () => {
        const input = feld.querySelector('input');
        if (input && !input.disabled) input.focus();
    });
});

// ================== INPUT EVENTS ==================
function addPairListeners(inputA, inputB, factor, isHbA1c = false) {
    if (!inputA || !inputB) return;

    inputA.addEventListener("input", () => {
        if (inputA.value === "") {
            inputB.value = "";
            if (!isHbA1c) updateAllCalculated();
            return;
        }
        inputB.value = isHbA1c
            ? ((inputA.value - 2.15) * factor).toFixed(2)
            : (inputA.value * factor).toFixed(2);
        if (!isHbA1c) updateAllCalculated();
        saveInput(inputA);
    });

    inputB.addEventListener("input", () => {
        if (inputB.value === "") {
            inputA.value = "";
            if (!isHbA1c) updateAllCalculated();
            return;
        }
        inputA.value = isHbA1c
            ? (inputB.value / factor + 2.15).toFixed(1)
            : (inputB.value / factor).toFixed(0);
        if (!isHbA1c) updateAllCalculated();
        saveInput(inputA);
    });
}

// Paare registrieren
addPairListeners(inputs[1], inputs[2], factor1);
addPairListeners(inputs[3], inputs[4], factor2);
addPairListeners(inputs[5], inputs[6], factor3);
addPairListeners(inputs[7], inputs[8], factor4);
addPairListeners(inputs[9], inputs[10], factor5);
addPairListeners(inputs[13], inputs[14], factor6);
addPairListeners(inputs[17], inputs[18], factor7);
addPairListeners(inputs[19], inputs[20], factor8, true);





// ================== BERECHNUNGEN ==================
function updateAllCalculated() {
    updateInput11();
    updateInput15();
    updateInput21and22();
    updateInput23();
    updateInput25();
    updateInput27();
    updateInput29();
    updateInput31(); 
    updateInput33();

    updateFachQuotient(15, 13, 35);
    updateFachQuotient(3, 13, 36);
}


function updateInput11() {
    const Input3 = inputs[3], Input7 = inputs[7], Input9 = inputs[9], Input11 = inputs[11], Input12 = inputs[12];
    if (!Input3 || !Input7 || !Input9 || !Input11 || !Input12) return;

    if (Input9.value && Input7.value && Input3.value) {
        if (Number(Input3.value) <= 350) {
            Input11.value = (Number(Input9.value) - Number(Input7.value) - Number(Input3.value) / 5).toFixed(0);
            Input12.value = (Input11.value * 0.026).toFixed(2);
        } else {
            Input11.value = "Berechnung nicht möglich";
            Input12.value = "Berechnung nicht möglich";
        }
    } else {
        Input11.value = "";
        Input12.value = "";
    }
}

function updateInput15() {
    const Input7 = inputs[7], Input9 = inputs[9], Input15 = inputs[15], Input16 = inputs[16];
    if (!Input7 || !Input9 || !Input15 || !Input16) return;

    if (Input9.value && Input7.value) {
        Input15.value = (Input9.value - Input7.value).toFixed(0);
        Input16.value = (Input15.value * 0.026).toFixed(2);
    } else {
        Input15.value = "";
        Input16.value = "";
    }
}
function updateInput21and22() {
    const Input3 = inputs[3];
    const Input21 = inputs[21];
    const Input22 = inputs[22];

    if (!Input3 || !Input21 || !Input22) return;

    if (Input3.value) {
        Input21.value = (Number(Input3.value) / 5).toFixed(0);
        Input22.value = (Number(Input21.value) * 0.026).toFixed(2);
    } else {
        Input21.value = "";
        Input22.value = "";
    }
}
// ================== PAGE LOAD ==================
window.addEventListener("DOMContentLoaded", () => {
    // 🔹 nur ungerade Inputs laden
    const TOGGEL = localStorage.getItem("TOGGEL");
    if (TOGGEL !== null) {
        document.querySelectorAll('.toggle-item').forEach(el => {
            el.style.display = TOGGEL === "true" ? 'grid' : 'none';
            toggle.checked = TOGGEL === "true";
        });
    }

    Object.keys(localStorage).forEach(key => {
        const input = get(key);
        if (!input) return;
        const num = parseInt(key, 10);
        if (num % 2 === 1) {
            input.value = localStorage.getItem(key);
        }
    });

    // 🔹 alle geraden Inputs neu berechnen
    setTimeout(() => {
        recalcAllPairs();
        updateAllCalculated();
    }, 100);

    // 🔹 Staggered input animation
    document.querySelectorAll('.eingabefeld').forEach((feld, index) => {
        feld.style.animationDelay = `${0.3 + (index * 0.05)}s`;
        feld.classList.add('fade-in-up');
    });

    // 🔹 Page slide transition
    setTimeout(() => {
        document.body.classList.add("page-loaded");
    }, 50);

    document.querySelectorAll("a[href]").forEach(link => {
        link.addEventListener("click", e => {
            const href = link.getAttribute("href");
            if (!href || href === "#" || href.startsWith("http") || link.target === "_blank") return;
            if (href === window.location.pathname.split("/").pop()) return;
            e.preventDefault();
            
            // Add scale effect for smoother transition
            if (link.id === "Back_BTN") {
                document.body.classList.add("exit-right");
                document.body.style.transformOrigin = "right center";
            } else {
                document.body.classList.add("exit-left");
                document.body.style.transformOrigin = "left center";
            }
            
            setTimeout(() => window.location.href = href, 450);
        });
    });
});

// CSS für staggered animation hinzufügen
const style = document.createElement('style');
style.textContent = `
    .fade-in-up {
        animation: fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) both;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(15px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

function recalcAllPairs() {
    if (inputs[1]?.value)  inputs[2].value  = (inputs[1].value * factor1).toFixed(2);
    if (inputs[3]?.value)  inputs[4].value  = (inputs[3].value * factor2).toFixed(2);
    if (inputs[5]?.value)  inputs[6].value  = (inputs[5].value * factor3).toFixed(2);
    if (inputs[7]?.value)  inputs[8].value  = (inputs[7].value * factor4).toFixed(2);
    if (inputs[9]?.value)  inputs[10].value = (inputs[9].value * factor5).toFixed(2);
    if (inputs[13]?.value) inputs[14].value = (inputs[13].value * factor6).toFixed(2);
    if (inputs[17]?.value) inputs[18].value = (inputs[17].value * factor7).toFixed(2);
    if (inputs[19]?.value) inputs[20].value = ((inputs[19].value - 2.15) * factor8).toFixed(2);
    if (inputs[3]?.value) {
    inputs[21].value = (inputs[3].value / 5).toFixed(0);
    inputs[22].value = (inputs[21].value * 0.026).toFixed(2);
    }
    if (inputs[18]?.value) {
        const valueMgDl = inputs[18].value * 0.077;
        inputs[25].value = valueMgDl.toFixed(1).replace(".", ",");
        inputs[26].value = (valueMgDl * 0.026).toFixed(2).replace(".", ",");
    }
    if (inputs[1]?.value && inputs[25]?.value) {

        const corrLDL =
        Number(inputs[1].value) -
        Number(String(inputs[25].value).replace(",", "."));

    inputs[27].value = corrLDL.toFixed(0).replace(".", ",");
    inputs[28].value = (corrLDL * 0.026).toFixed(2).replace(".", ",");
}
if (inputs[18]?.value && inputs[13]?.value) {

    const lpa =
        Number(String(inputs[18].value).replace(",", "."));

    const apob_g_l =
        Number(String(inputs[13].value).replace(",", ".")) * 0.01;

    const result =
        ((lpa * lpa) / apob_g_l) * 0.48;

    inputs[29].value = result.toFixed(1).replace(".", ",");
    inputs[30].value = (result * 0.026).toFixed(2).replace(".", ",");
}
if (inputs[1]?.value && inputs[29]?.value) {
    const corrAHA = Number(inputs[1].value) - Number(String(inputs[29].value).replace(",", "."));
    inputs[31].value = corrAHA.toFixed(0).replace(".", ",");
    inputs[32].value = (corrAHA * 0.026).toFixed(2).replace(".", ",");
}
}

const toggle = document.getElementById('toggel-All');

toggle.addEventListener('change', () => {
    document.querySelectorAll('.toggle-item').forEach(el => {
        el.style.display = toggle.checked ? 'grid' : 'none';
        localStorage.setItem("TOGGEL", ""+toggle.checked);
    });
});


function updateInput23() {

    const TC  = inputs[9];
    const HDL = inputs[7];
    const TG  = inputs[3];
    const LDLcs = inputs[23];
    const LDLcs_mmol = inputs[24];

    if (!TC || !HDL || !TG || !LDLcs || !LDLcs_mmol) return;

    if (TC.value && HDL.value && TG.value) {

        const tc  = Number(TC.value);
        const hdl = Number(HDL.value);
        const tg  = Number(TG.value);
        const nonHDL = tc - hdl;

        const eLDLcs =
            (tc / 0.948)
            - (hdl / 0.971)
            - ((tg / 8.56) + ((tg * nonHDL) / 2140) - ((tg * tg) / 16100))
            - 9.44;

            LDLcs.value = eLDLcs.toFixed(0).replace(".", ",");
            LDLcs_mmol.value = (eLDLcs * 0.026).toFixed(2).replace(".", ",");

    } else {
        LDLcs.value = "";
        LDLcs_mmol.value = "";
    }

}


document.addEventListener("DOMContentLoaded", () => {

  const fieldMap = {
    "Cholesterin gesamt": "9Input",
    "HDL-Cholesterin": "7Input",
    "LDL-Cholesterin": "1Input",
    "Triglyceride": "3Input",
    "Apolipoprotein B": "13Input",
    "HbA1c": "19Input",
    "Kreatinin": "5Input",
    "Lipoprotein(a)": "18Input"
  };

  document.addEventListener("paste", (event) => {
    const text = (event.clipboardData || window.clipboardData).getData("text");
    setTimeout(() => parseAndFill(text), 50);
  });

  function parseAndFill(text) {

    const lines = text
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    let skipNext = false;

    for (let i = 0; i < lines.length; i++) {

      if (skipNext) {
        skipNext = false;
        continue;
      }

      let line = lines[i];

      if (line.toLowerCase().includes("berechnet")) {
        skipNext = true;
        continue;
      }

      for (const key in fieldMap) {

        if (line.includes(key)) {

          const value = findNextNumber(lines, i);

          if (value !== null) {

            const input = document.getElementById(fieldMap[key]);

            if (input) {

              input.value = value;

         
              input.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }
        }
      }
    }
  }

  function findNextNumber(lines, index) {

    for (let j = index + 1; j < lines.length; j++) {

      let val = lines[j]
        .replace(",", ".")
        .replace(/[^0-9.]/g, "");

      if (val && !isNaN(val)) {
        return parseFloat(val);
      }
    }

    return null;
  }

});

function updateInput25() {

    const Lpa = inputs[18]; 
    const Input25 = inputs[25];
    const Input26 = inputs[26];

    if (!Lpa || !Input25 || !Input26) return;

    if (Lpa.value) {

        const valueMgDl = Number(Lpa.value) * 0.077;

        Input25.value = valueMgDl.toFixed(0).replace(".", ",");
        Input26.value = (valueMgDl * 0.026).toFixed(2).replace(".", ",");

    } else {

        Input25.value = "";
        Input26.value = "";
    }
}

function updateInput27() {

    const LDL = inputs[1];
    const LpaCRM = inputs[25];

    const Input27 = inputs[27];
    const Input28 = inputs[28];

    if (!LDL || !LpaCRM || !Input27 || !Input28) return;

    if (LDL.value && LpaCRM.value) {

        const corrLDL = Number(LDL.value) - Number(String(LpaCRM.value).replace(",", "."));

        Input27.value = corrLDL.toFixed(0).replace(".", ",");
        Input28.value = (corrLDL * 0.026).toFixed(2).replace(".", ",");

    } else {

        Input27.value = "";
        Input28.value = "";
    }
}

function updateInput29() {

    const Lpa = inputs[18];   
    const ApoB = inputs[13]; 

    const Input29 = inputs[29];
    const Input30 = inputs[30];

    if (!Lpa || !ApoB || !Input29 || !Input30) return;

    if (Lpa.value && ApoB.value) {

        const lpa = Number(String(Lpa.value).replace(",", "."));
        const result =
            (lpa*lpa) / (ApoB.value * 48);

        Input29.value = result.toFixed(0).replace(".", ",");
        Input30.value = (result * factor1).toFixed(2).replace(".", ",");

    } else {

        Input29.value = "";
        Input30.value = "";
    }
}


function updateInput31() {
    const LDL   = inputs[1];
    const LpaCaha = inputs[29];
    const Input31 = inputs[31];
    const Input32 = inputs[32];

    if (!LDL || !LpaCaha || !Input31 || !Input32) return;

    if (LDL.value && LpaCaha.value) {
        const corrLDL = Number(LDL.value) - Number(String(LpaCaha.value).replace(",", "."));
        Input31.value = corrLDL.toFixed(0).replace(".", ",");
        Input32.value = (corrLDL * 0.026).toFixed(2).replace(".", ",");
    } else {
        Input31.value = "";
        Input32.value = "";
    }
}

function updateInput33() {
    const gLDLC  = inputs[1];
    const eLDLc = inputs[11];
    const Input33 = inputs[33];
    const Input34 = inputs[34];
    
    if (!gLDLC || !eLDLc || !Input33 || !Input34) return;

    if (gLDLC.value && eLDLc.value) {
        const deltaLDL = Number(gLDLC.value) - Number(String(eLDLc.value).replace(",", "."));
        Input33.value = deltaLDL.toFixed(0).replace(".", ",");
        Input34.value = (deltaLDL * 0.026).toFixed(2).replace(".", ",");
    } else {
        Input33.value = "";
        Input34.value = "";
    }
}


function updateFachQuotient(numeratorInput, denominatorInput, outputInput) {
    const numerator = inputs[numeratorInput];   
    const denominator = inputs[denominatorInput]; 

    const out = inputs[outputInput];

    if (!numerator || !denominator || !out ) return;

    if (numerator.value && denominator.value && Number(denominator.value) !== 0) {

        const quotient = Number(numerator.value) / Number(denominator.value);

        out.value = quotient.toFixed(1);

    } else {
        out.value = "";
        
    }
}