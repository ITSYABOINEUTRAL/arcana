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