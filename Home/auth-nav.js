// ===== AUTH NAV =====

const API = "http://localhost:3000/api";

// =====================================================
// BỘ AVATAR DO WEB CẤP
// Khi bạn có ảnh thật, thay các đường dẫn bên dưới.
// Đặt ảnh vào thư mục: images/avatars/
// =====================================================
const AVATAR_LIST = [
  { id: 1,  src: "../images/avatars/av1.png",  label: "Avatar 1"  },
  { id: 2,  src: "../images/avatars/av2.png",  label: "Avatar 2"  },
  { id: 3,  src: "../images/avatars/av3.png",  label: "Avatar 3"  },
  { id: 4,  src: "../images/avatars/av4.png",  label: "Avatar 4"  },
  { id: 5,  src: "../images/avatars/av5.png",  label: "Avatar 5"  },
  { id: 6,  src: "../images/avatars/av6.png",  label: "Avatar 6"  },
  { id: 7,  src: "../images/avatars/av7.png",  label: "Avatar 7"  },
  { id: 8,  src: "../images/avatars/av8.png",  label: "Avatar 8"  },
  { id: 9,  src: "../images/avatars/av9.png",  label: "Avatar 9"  },
  { id: 10, src: "../images/avatars/av10.png", label: "Avatar 10" },
  { id: 11, src: "../images/avatars/av11.png", label: "Avatar 11" },
  { id: 12, src: "../images/avatars/av12.png", label: "Avatar 12" },
];

const FALLBACK_AVATAR = "https://ui-avatars.com/api/?background=f37021&color=fff&bold=true&size=128";

// ===== Elements =====
const navLoginBtn        = document.getElementById("nav-login-btn");
const navAvatarWrap      = document.getElementById("nav-avatar-wrap");
const navAvatarImg       = document.getElementById("nav-avatar-img");
const navDropdown        = document.getElementById("nav-dropdown");
const navDropName        = document.getElementById("nav-dropdown-name");
const navLogoutBtn       = document.getElementById("nav-logout-btn");
const navChangeAvatarBtn = document.getElementById("nav-change-avatar-btn");
const avatarPopupOverlay = document.getElementById("avatar-popup-overlay");
const avatarPopupClose   = document.getElementById("avatar-popup-close");
const avatarGrid         = document.getElementById("avatar-grid");

// ===== Render lưới avatar =====
function renderAvatarGrid(currentSrc) {
  avatarGrid.innerHTML = "";
  AVATAR_LIST.forEach(av => {
    const item = document.createElement("div");
    item.className = "avatar-grid-item" + (currentSrc === av.src ? " selected" : "");

    const img = document.createElement("img");
    img.src = av.src;
    img.alt = av.label;
    // Nếu chưa có ảnh thật → dùng placeholder màu
    img.onerror = function() {
      this.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(av.label)
               + "&background=f37021&color=fff&bold=true&size=128&rounded=true";
      this.onerror = null;
    };

    item.appendChild(img);
    item.addEventListener("click", () => selectAvatar(av.src, item));
    avatarGrid.appendChild(item);
  });
}

// ===== Chọn avatar =====
function selectAvatar(src, clickedItem) {
  const user = getCurrentUser();
  if (!user) return;

  const key = "avatar_" + (user.username || user.email);
  localStorage.setItem(key, src);

  // Cập nhật hiển thị navbar ngay
  navAvatarImg.src = src;
  navAvatarImg.onerror = function() {
    this.src = FALLBACK_AVATAR + "&name=" + encodeURIComponent(user.username || "U");
    this.onerror = null;
  };

  // Đánh dấu selected trong grid
  document.querySelectorAll(".avatar-grid-item").forEach(el => el.classList.remove("selected"));
  if (clickedItem) clickedItem.classList.add("selected");

  setTimeout(() => closeAvatarPopup(), 280);
}

// ===== Popup =====
function openAvatarPopup() {
  const user = getCurrentUser();
  const key  = user ? "avatar_" + (user.username || user.email) : null;
  renderAvatarGrid(key ? localStorage.getItem(key) : null);
  avatarPopupOverlay.classList.add("open");
}

function closeAvatarPopup() {
  avatarPopupOverlay.classList.remove("open");
}

// ===== Helpers =====
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}

function getSavedAvatar(user) {
  return localStorage.getItem("avatar_" + (user.username || user.email));
}

// ===== Events =====
navAvatarImg.addEventListener("click", (e) => {
  e.stopPropagation();
  navDropdown.classList.toggle("open");
});

document.addEventListener("click", () => navDropdown.classList.remove("open"));

navChangeAvatarBtn.addEventListener("click", (e) => {
  e.preventDefault();
  navDropdown.classList.remove("open");
  openAvatarPopup();
});

avatarPopupClose.addEventListener("click", closeAvatarPopup);
avatarPopupOverlay.addEventListener("click", (e) => {
  if (e.target === avatarPopupOverlay) closeAvatarPopup();
});

navLogoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showLogin();
});


// ===== Hiện / ẩn =====
function showLogin() {
  navLoginBtn.style.display = "";
  navAvatarWrap.style.display = "none";
}

function showAvatar(user) {
  const username = user.username || user.email || "User";
  const saved    = getSavedAvatar(user);

  navLoginBtn.style.display = "none";
  navAvatarWrap.style.display = "flex";
  navDropName.textContent = username;

  navAvatarImg.src = saved || (FALLBACK_AVATAR + "&name=" + encodeURIComponent(username));
  navAvatarImg.onerror = function() {
    this.src = FALLBACK_AVATAR + "&name=" + encodeURIComponent(username);
    this.onerror = null;
  };
}

// ===== Auto check khi load =====
(function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) return showLogin();

  const cached = localStorage.getItem("user");
  if (cached) {
    try { showAvatar(JSON.parse(cached)); return; } catch {}
  }

  fetch(API + "/me", { headers: { Authorization: "Bearer " + token } })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        showAvatar(data.user);
      } else {
        localStorage.removeItem("token");
        showLogin();
      }
    })
    .catch(() => { localStorage.removeItem("token"); showLogin(); });
})();
