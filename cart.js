// === cart.js (UPDATED) ===
let subtotalUSD = 0;
let totalUSD = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');

  if (!token || !userEmail) {
    alert("You must be logged in to access your cart.");
    window.location.href = "account.html";
    return;
  }

  const API_BASE = "https://arcana-backend-z46k.onrender.com/api";
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
      shippingCost = isNigeria ? 3.5 : 20;
      
    } catch {
      shippingCost = 20;
    }
  }
  let shippingFee = shippingCost;

  function calculateAndDisplayTotals() {
    const rate = currencyRates[currentCurrency];
    subtotalUSD = 0;

    cartData.forEach(item => {
      subtotalUSD += item.price * item.quantity;
    });

    const shippingConverted = shippingCost * rate;
    totalUSD = subtotalUSD + shippingCost;
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

  document.getElementById("checkout-btn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");

  if (!token || !userEmail) {
    alert("Please sign in to continue.");
    return window.location.href = "account.html";
  }

    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const user = await res.json();
      const hasAddress = Array.isArray(user.addresses) && user.addresses.length > 0;
      const hasPhone = user.phone && user.phone.trim() !== "";

      if (!hasAddress || !hasPhone) {
        alert("⚠️ Please go to your account dashboard to save your shipping address and phone number before checkout.");
        localStorage.setItem("returnAfterSettings", "cart.html");
        return window.location.href = "edit-settings.html";
      }

      const address = user.addresses[0];
      const amountInKobo = Math.round(fullTotalUSD * 1547.30 * 100);
      const reference = `ARC${Date.now()}`;

      const orderRes = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          products: cartData.map(i => ({
            productId: i.product._id,
            title: i.product.name,
            image: i.product.image,
            size: i.size,
            quantity: i.quantity,
            price: i.price
          })),
          shippingAddress: address,
          phoneNumber: user.phone,
          totalPrice: subtotalUSD,
          shippingFee: shippingCost,
          reference
        })
      });

      const orderData = await orderRes.json();

      const payRes = await fetch(`${API_BASE}/paystack/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: userEmail,
          amount: amountInKobo,
          reference
        })
      });

      const data = await payRes.json();
      if (data.data && data.data.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        alert("Failed to initialize payment.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("An error occurred. Please try again.");
    }
  });
});
