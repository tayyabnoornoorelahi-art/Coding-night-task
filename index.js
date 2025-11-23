window.addEventListener("DOMContentLoaded", () => {
    if(localStorage.getItem("isLoggedIn") !== "true"){
        window.location.href = "login.html";
    }
});

const currentUser = JSON.parse(localStorage.getItem('loggedInUser')) || {email:'user@test.com', firstName:'Tayyab', lastName:'Noor', profileImage:''};
const posts = JSON.parse(localStorage.getItem('posts')) || [];

const feedEl = document.getElementById('feed');
const navAvatar = document.getElementById('navAvatar');
const welcomeName = document.getElementById('welcomeName');
const postBtn = document.getElementById('postQuick');
const quickText = document.getElementById('quickText');
const quickImage = document.getElementById('quickImage');

let editingId = null;

function savePosts(){ localStorage.setItem('posts', JSON.stringify(posts)); }

function formatTime(t){ return new Date(t).toLocaleString(); }

function renderProfile(){
    welcomeName.innerText = `Welcome, ${currentUser.firstName || 'User'}`;
    if(currentUser.profileImage){
        navAvatar.style.backgroundImage = `url(${currentUser.profileImage})`;
        navAvatar.innerText = '';
    } else {
        navAvatar.innerText = (currentUser.firstName || 'U').charAt(0).toUpperCase();
        navAvatar.style.backgroundImage = '';
    }
}
renderProfile();

function renderPosts(){
    feedEl.innerHTML = '';
    if(posts.length === 0){
        feedEl.innerHTML = '<div>No posts yet.</div>';
        return;
    }

    posts.slice().reverse().forEach(post => {
        const div = document.createElement('div');
        div.className = 'post';
        div.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px;">
                <div style="width:30px;height:30px;border-radius:50%;background:#ccc;${post.profileImage ? `background-image:url(${post.profileImage});background-size:cover;` : ''}">
                    ${!post.profileImage ? (post.userName || 'U').charAt(0).toUpperCase() : ''}
                </div>
                <strong>${post.userName}</strong>
                <span style="margin-left:auto;font-size:12px;color:#666;">${formatTime(post.id)}</span>
            </div>
            <p>${post.text}</p>
            ${post.image ? `<img src="${post.image}" style="max-width:100%;border-radius:5px;margin-top:5px;" />` : ''}
            <div style="margin-top:5px;">
                <button class="like-btn" data-id="${post.id}">❤️ ${post.likes || 0}</button>
                ${post.userEmail === currentUser.email ? `<button class="edit-btn" data-id="${post.id}">✏️</button><button class="delete-btn" data-id="${post.id}">🗑️</button>` : ''}
            </div>
        `;
        feedEl.appendChild(div);
    });

    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.onclick = () => toggleLike(+btn.dataset.id);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => {
            const idx = posts.findIndex(p => p.id === +btn.dataset.id);
            if(idx !== -1 && confirm('Delete this post?')){
                posts.splice(idx,1);
                savePosts();
                renderPosts();
            }
        };
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => openEdit(+btn.dataset.id);
    });
}

function toggleLike(postId){
    const post = posts.find(p => p.id === postId);
    if(!post) return;
    post.likes = (post.likes || 0) + 1;
    savePosts();
    renderPosts();
}

postBtn.addEventListener('click', ()=>{
    const text = quickText.value.trim();
    const image = quickImage.value.trim();
    if(!text) return alert('Post cannot be empty.');

    const newPost = {
        id: Date.now(),
        userEmail: currentUser.email,
        userName: (currentUser.firstName || '') + (currentUser.lastName ? (' ' + currentUser.lastName) : ''),
        profileImage: currentUser.profileImage || '',
        text,
        image,
        likes: 0
    };

    posts.push(newPost);
    savePosts();
    quickText.value = '';
    quickImage.value = '';
    renderPosts();
});

function openEdit(id){
    editingId = id;
    const post = posts.find(p=>p.id===id);
    if(!post) return;
    document.getElementById('editText').value = post.text;
    document.getElementById('editImage').value = post.image || '';
    document.getElementById('editModal').style.display = 'flex';
}

document.getElementById('cancelEdit').onclick = ()=> {
    document.getElementById('editModal').style.display = 'none';
};

document.getElementById('saveEdit').onclick = ()=>{
    const txt = document.getElementById('editText').value.trim();
    const img = document.getElementById('editImage').value.trim();
    const post = posts.find(p=>p.id===editingId);
    if(post){
        post.text = txt;
        post.image = img;
        savePosts();
        renderPosts();
        document.getElementById('editModal').style.display = 'none';
    }
};

document.getElementById('logout').onclick = ()=>{
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
};

renderPosts();
