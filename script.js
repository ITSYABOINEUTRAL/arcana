const currencyRates = {
  USD: 1,
  EUR: 0.8666,
  GBP: 0.7375,
  NGN: 1547.30
};

const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦"
};

const currencySelector = document.getElementById("currency");
const prices = document.querySelectorAll(".product-price");

currencySelector.addEventListener("change", () => {
  const selectedCurrency = currencySelector.value;
  prices.forEach(priceEl => {
    const usdPrice = parseFloat(priceEl.getAttribute("data-usd"));
    const converted = usdPrice * currencyRates[selectedCurrency];
    priceEl.textContent = currencySymbols[selectedCurrency] + converted.toFixed(2);
  });
});
var MenuItems = document.getElementById("MenuItems");

MenuItems.style.maxHeight = "0px";

function menuToggle() {
  if (MenuItems.style.maxHeight == "0px") {
        MenuItems.style.maxHeight = "200px";
  } else {
        MenuItems.style.maxHeight = "0px";
  }
}
/* =========================
   TYPE 1 – TOAST
========================= */
function showToast(message, type = "success") {
  const container = document.getElementById("notification-container");
  if (!container) return;

  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;

  container.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = "0";
    notif.style.transform = "translateY(-20px)";
    setTimeout(() => notif.remove(), 400);
  }, 3500);
}

// Override alert globally → Type 1
window.alert = function (message) {
  showToast(message, "success");
};


/* =========================
   TYPE 2 – BLOCKING MODAL
========================= */
function showBlockingMessage(message, redirectTo) {
  const overlay = document.getElementById("arcana-modal-overlay");
  const text = document.getElementById("arcana-modal-text");

  text.textContent = message;
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  overlay.querySelector(".close").onclick = () => {
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
    if (redirectTo) window.location.href = redirectTo;
  };
}
document.getElementById('year').textContent = new Date().getFullYear();