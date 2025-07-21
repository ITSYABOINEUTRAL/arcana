const API_BASE = 'https://arcana-backend-z46k.onrender.com/api';
const token = localStorage.getItem('token');

if (!token) {
  alert("You must be logged in to access your dashboard.");
  window.location.href = "account.html";
}

// GET user profile
fetch(`${API_BASE}/user/profile`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    document.getElementById("user-name").textContent = `Name: ${data.name}`;
    document.getElementById("user-email").textContent = `Email: ${data.email}`;
    document.getElementById("user-phone").textContent = `Phone: ${data.phone || 'Not provided'}`;

    if (data.addresses && data.addresses.length > 0) {
      const addr = data.addresses[0];
      const formattedAddress = `${addr.street}, ${addr.city}, ${addr.state}, ${addr.zip}, ${addr.country}`;
      document.getElementById("user-address").innerHTML = `<li>${formattedAddress}</li>`;
    } else {
      document.getElementById("user-address").innerHTML = "<li>No saved address</li>";
    }

    if (data.profilePicture) {
      document.getElementById("user-profile-pic").src = data.profilePicture;
    }
  })
  .catch(() => {
    alert("Failed to load profile. Please log in again.");
    window.location.href = "account.html";
  });

// GET order history
fetch(`${API_BASE}/user/orders`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("order-history");
    if (data.length === 0) {
      list.innerHTML = "<li>No orders found.</li>";
    } else {
      data.forEach(order => {
        const li = document.createElement("li");
        li.textContent = `#${order.orderNumber} - ${order.status}`;
        list.appendChild(li);
      });
    }
  });

// Handle profile picture upload
const uploadForm = document.getElementById("upload-form");
uploadForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const file = document.getElementById("profile-pic-file").files[0];
  if (!file) return alert("Please select an image.");

  const formData = new FormData();
  formData.append("profilePic", file); // Must match backend field name

  const status = document.getElementById("upload-status");
  status.textContent = "Uploading...";
  status.style.color = "#555";

  try {
    const res = await fetch(`${API_BASE}/auth/upload-profile-pic`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    document.getElementById("user-profile-pic").src = data.url;
    status.textContent = "Uploaded successfully!";
    status.style.color = "green";
  } catch (err) {
    console.error(err);
    status.textContent = "Upload failed.";
    status.style.color = "red";
  }
});

// Logout
function logout() {
  localStorage.removeItem('token');
  alert("You’ve been logged out.");
  window.location.href = "account.html";
}
