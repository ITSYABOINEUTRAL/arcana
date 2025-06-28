document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("You must be logged in to access your cart.");
    window.location.href = "account.html";
    return;
  }

  const API_BASE = "http://localhost:5000/api";
  const cartContainer = document.querySelector('#cart-container tbody');
  const subtotalEl = document.querySelector(".subtotal");
  const shippingEl = document.querySelector(".shipping");
  const totalEl = document.querySelector(".Total");
  const currencySelector = document.getElementById("currency");

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

  let currentCurrency = currencySelector.value;
  let cartData = [];
  let shippingCost = 0;

  async function fetchAddress() {
    try {
      const res = await fetch(`${API_BASE}/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const addresses = await res.json();
      const isNigeria = addresses.some(addr =>
        addr.country?.toLowerCase().includes('nigeria')
      );
      shippingCost = isNigeria ? 10 : 20;
    } catch {
      shippingCost = 20;
    }
  }

  function calculateAndDisplayTotals() {
    const rate = currencyRates[currentCurrency];
    let subtotalUSD = 0;

    cartData.forEach(item => {
      subtotalUSD += item.price * item.quantity;
    });

    const shippingConverted = shippingCost * rate;
    const totalUSD = subtotalUSD + shippingCost;
    const subtotalConverted = subtotalUSD * rate;
    const totalConverted = totalUSD * rate;

    subtotalEl.textContent = currencySymbols[currentCurrency] + subtotalConverted.toFixed(2);
    shippingEl.textContent = currencySymbols[currentCurrency] + shippingConverted.toFixed(2);
    totalEl.textContent = currencySymbols[currentCurrency] + totalConverted.toFixed(2);
  }

  function renderCart() {
    cartContainer.innerHTML = "";

    cartData.forEach(item => {
      const name = item.product?.name || "Unnamed";
      const price = item.price;
      const img = item.product?.image || 'default.png';
      const priceConverted = price * currencyRates[currentCurrency];
      const totalConverted = price * item.quantity * currencyRates[currentCurrency];
      const itemId = item._id;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td><button class="remove-btn" data-id="${itemId}"><i class="fas fa-trash-alt"></i></button></td>
        <td><img src="${img}" alt="${name}"></td>
        <td><h5 class="product-name">${name}</h5></td>
        <td><h5 class="size">${item.size || '—'}</h5></td>
        <td><h5 class="product-price" data-usd="${price}">${currencySymbols[currentCurrency]}${priceConverted.toFixed(2)}</h5></td>
        <td><input class="quantity-input" type="number" min="1" value="${item.quantity}" data-id="${item.product._id}"></td>
        <td class="item-total" data-id="${item.product._id}"><h5>${currencySymbols[currentCurrency]}${totalConverted.toFixed(2)}</h5></td>
      `;
      cartContainer.appendChild(row);
    });

    calculateAndDisplayTotals();
    bindQuantityListeners();
    bindRemoveButtons();
  }

  function bindQuantityListeners() {
    const inputs = document.querySelectorAll(".quantity-input");

    inputs.forEach(input => {
      input.addEventListener("input", async () => {
        const id = input.dataset.id;
        const newQty = parseInt(input.value) || 1;

        try {
          await fetch(`${API_BASE}/cart/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ productId: id, quantity: newQty })
          });

          cartData = cartData.map(i =>
            i.product._id === id ? { ...i, quantity: newQty } : i
          );
          renderCart();
        } catch (err) {
          console.error("Quantity update failed", err);
        }
      });
    });
  }

  function bindRemoveButtons() {
    const buttons = document.querySelectorAll(".remove-btn");

    buttons.forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;

        try {
          await fetch(`${API_BASE}/cart/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });

          cartData = cartData.filter(i => i._id !== id);
          renderCart();
        } catch (err) {
          console.error("Delete failed", err);
        }
      });
    });
  }

  currencySelector.addEventListener("change", () => {
    currentCurrency = currencySelector.value;
    renderCart();
  });

  async function fetchCart() {
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        cartContainer.innerHTML = '<tr><td colspan="7" style="text-align:center;">You have saved nothing to your cart.</td></tr>';
        const rate = currencyRates[currentCurrency];
        const shippingConverted = shippingCost * rate;

        subtotalEl.textContent = currencySymbols[currentCurrency] + "0.00";
        shippingEl.textContent = currencySymbols[currentCurrency] + shippingConverted.toFixed(2);
        totalEl.textContent = currencySymbols[currentCurrency] + shippingConverted.toFixed(2);
        return;
      }

      cartData = data.items;
      renderCart();
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  }

  await fetchAddress();
  await fetchCart();
});
