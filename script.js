script.js
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