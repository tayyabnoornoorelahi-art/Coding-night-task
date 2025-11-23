// ---------- LOGIN CHECK ----------
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}



window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
    }
});

const currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || {
    email: "user@test.com",
    firstName: "Tayyab",
    lastName: "Noor",
    profileImage: "",
    description: ""
};

const posts = JSON.parse(localStorage.getItem("posts")) || [];

const feedEl = document.getElementById("feed");
const navAvatar = document.getElementById("navAvatar");
const postBtn = document.getElementById("postQuick");
const quickText = document.getElementById("quickText");
const quickImage = document.getElementById("quickImage");
const composeAvatar = document.getElementById("composeAvatar");
const composeName = document.getElementById("composeName");
const sideAvatar = document.getElementById("sideAvatar");
const sideName = document.getElementById("sideName");
const sideEmail = document.getElementById("sideEmail");
const sideDesc = document.getElementById("sideDesc");
const searchInput = document.getElementById("searchInput");
const sortBtn = document.getElementById("sortBtn");
const themeToggle = document.getElementById("themeToggle");
const previewBtn = document.getElementById("previewBtn");
const chips = Array.from(document.querySelectorAll(".chip"));

let editingId = null;
let activeSort = localStorage.getItem("buzz_sort") || "latest";
let activeTheme = localStorage.getItem("buzz_theme") || "dark";

function savePosts() {
    localStorage.setItem("posts", JSON.stringify(posts));
}

function formatTime(t) {
    return new Date(t).toLocaleString();
}

function applyTheme() {
    if (activeTheme === "light") {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        themeToggle.innerText = "🌞";
    } else {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        themeToggle.innerText = "🌙";
    }
    localStorage.setItem("buzz_theme", activeTheme);
}

function loadProfileUI() {
    const name = (currentUser.firstName || "User") + (currentUser.lastName ? " " + currentUser.lastName : "");
    composeName.innerText = "Welcome, " + (currentUser.firstName || "User");
    sideName.innerText = name;
    sideEmail.innerText = currentUser.email || "email";
    sideDesc.innerText = currentUser.description || "Description...";

    if (currentUser.profileImage) {
        navAvatar.style.backgroundImage = `url(${currentUser.profileImage})`;
        composeAvatar.style.backgroundImage = `url(${currentUser.profileImage})`;
        sideAvatar.style.backgroundImage = `url(${currentUser.profileImage})`;
        navAvatar.innerText = "";
        composeAvatar.innerText = "";
        sideAvatar.innerText = "";
    } else {
        const letter = (currentUser.firstName || "U").charAt(0).toUpperCase();
        navAvatar.innerText = letter;
        composeAvatar.innerText = letter;
        sideAvatar.innerText = letter;
        navAvatar.style.backgroundImage = "";
        composeAvatar.style.backgroundImage = "";
        sideAvatar.style.backgroundImage = "";
    }
}

function getFilteredAndSortedPosts() {
    const q = (searchInput.value || "").trim().toLowerCase();
    let result = posts.slice();
    if (q) {
        result = result.filter(p => (p.text || "").toLowerCase().includes(q));
    }
    if (activeSort === "latest") {
        result.sort((a, b) => b.id - a.id);
    } else if (activeSort === "oldest") {
        result.sort((a, b) => a.id - b.id);
    } else if (activeSort === "mostliked") {
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    return result;
}

function renderPosts() {
    feedEl.innerHTML = "";
    const list = getFilteredAndSortedPosts();
    if (list.length === 0) {
        feedEl.innerHTML = "<div>No posts yet.</div>";
        return;
    }
    list.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";
        const avatarHtml = post.profileImage
            ? `<div style="width:30px;height:30px;border-radius:50%;background:#ccc;background-image:url(${post.profileImage});background-size:cover"></div>`
            : `<div style="width:30px;height:30px;border-radius:50%;background:#ccc">${(post.userName||"U").charAt(0).toUpperCase()}</div>`;
        div.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px;">
                ${avatarHtml}
                <strong>${escapeHtml(post.userName)}</strong>
                <span style="margin-left:auto;font-size:12px;color:#666;">${formatTime(post.id)}</span>
            </div>
            <p class="post-body">${escapeHtml(post.text)}</p>
            ${post.image ? `<img src="${post.image}" class="post-img" />` : ""}
            <div class="post-actions">
                <div class="actions-left">
                    <button class="like-btn" data-id="${post.id}">❤️ ${post.likes || 0}</button>
                </div>
                <div class="owner-actions">
                    ${post.userEmail === currentUser.email ? `<button class="icon-btn edit-btn" data-id="${post.id}">✏️</button><button class="icon-btn delete-btn" data-id="${post.id}">🗑️</button>` : ""}
                </div>
            </div>
        `;
        feedEl.appendChild(div);
    });

    document.querySelectorAll(".like-btn").forEach(btn => {
        btn.onclick = () => toggleLike(+btn.dataset.id);
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = () => {
            const idx = posts.findIndex(p => p.id === +btn.dataset.id);
            if (idx !== -1 && confirm("Delete this post?")) {
                posts.splice(idx, 1);
                savePosts();
                renderPosts();
            }
        };
    });
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = () => openEdit(+btn.dataset.id);
    });
}

function toggleLike(postId) {
    const p = posts.find(x => x.id === postId);
    if (!p) return;
    p.likes = (p.likes || 0) + 1;
    savePosts();
    renderPosts();
}

postBtn.onclick = () => {
    const text = (quickText.value || "").trim();
    const image = (quickImage.value || "").trim();
    if (!text) {
        alert("Post cannot be empty.");
        return;
    }
    const name = (currentUser.firstName || "") + (currentUser.lastName ? " " + currentUser.lastName : "");
    posts.push({
        id: Date.now(),
        userEmail: currentUser.email,
        userName: name || "User",
        profileImage: currentUser.profileImage || "",
        text,
        image,
        likes: 0
    });
    savePosts();
    quickText.value = "";
    quickImage.value = "";
    renderPosts();
};

function openEdit(id) {
    editingId = id;
    const post = posts.find(p => p.id === id);
    if (!post) return;
    document.getElementById("editText").value = post.text;
    document.getElementById("editImage").value = post.image || "";
    document.getElementById("editModal").style.display = "flex";
}

document.getElementById("cancelEdit").onclick = () => {
    document.getElementById("editModal").style.display = "none";
};

document.getElementById("saveEdit").onclick = () => {
    const post = posts.find(p => p.id === editingId);
    if (!post) return;
    const txt = (document.getElementById("editText").value || "").trim();
    const img = (document.getElementById("editImage").value || "").trim();
    post.text = txt;
    post.image = img;
    savePosts();
    renderPosts();
    document.getElementById("editModal").style.display = "none";
};

document.getElementById("logout").onclick = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
};

searchInput.addEventListener("input", () => {
    renderPosts();
});

function setActiveSort(s) {
    activeSort = s;
    localStorage.setItem("buzz_sort", activeSort);
    sortBtn.innerText = "Sort: " + (activeSort === "latest" ? "Latest" : activeSort === "oldest" ? "Oldest" : "Most Liked");
    chips.forEach(c => {
        if (c.dataset.sort === activeSort) c.style.borderColor = "#60a5fa";
        else c.style.borderColor = "";
    });
    renderPosts();
}

sortBtn.onclick = () => {
    if (activeSort === "latest") setActiveSort("oldest");
    else if (activeSort === "oldest") setActiveSort("mostliked");
    else setActiveSort("latest");
};

chips.forEach(c => {
    c.onclick = () => setActiveSort(c.dataset.sort);
});

themeToggle.onclick = () => {
    activeTheme = activeTheme === "light" ? "dark" : "light";
    applyTheme();
};

previewBtn.onclick = () => {
    const text = (quickText.value || "").trim();
    const image = (quickImage.value || "").trim();
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.6)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "11000";
    const box = document.createElement("div");
    box.style.background = document.body.classList.contains("light-mode") ? "#fff" : "#1f2937";
    box.style.color = document.body.classList.contains("light-mode") ? "#111827" : "#f9fafb";
    box.style.padding = "16px";
    box.style.borderRadius = "10px";
    box.style.maxWidth = "90%";
    box.style.width = "520px";
    let html = `<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:#374151;display:flex;align-items:center;justify-content:center;">
                        ${(currentUser.firstName||"U").charAt(0).toUpperCase()}
                    </div>
                    <div style="font-weight:700">${escapeHtml((currentUser.firstName||"User") + (currentUser.lastName ? " " + currentUser.lastName : ""))}</div>
                </div>
                <div style="white-space:pre-wrap;margin-bottom:8px;">${escapeHtml(text || "(no text)")}</div>`;
    if (image) html += `<div><img src="${image}" style="max-width:100%;border-radius:6px;"/></div>`;
    html += `<div style="display:flex;justify-content:flex-end;margin-top:10px;"><button id="closePreview" class="btn">Close</button></div>`;
    box.innerHTML = html;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.getElementById("closePreview").onclick = () => document.body.removeChild(overlay);
};

function escapeHtml(str) {
    if (!str && str !== "") return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

applyTheme();
loadProfileUI();
setActiveSort(activeSort);
renderPosts();
