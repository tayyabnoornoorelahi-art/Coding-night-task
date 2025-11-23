if(localStorage.getItem("isLoggedIn") !== "true"){
    window.location.href = "login.html";
}

const currentUser = JSON.parse(localStorage.getItem('loggedInUser')) || {email:'user@test.com', firstName:'Tayyab', lastName:'Noor', profileImage:''};
const posts = JSON.parse(localStorage.getItem('posts')) || [];

function savePosts(){ localStorage.setItem('posts', JSON.stringify(posts)); }

function formatTime(t){ return new Date(t).toLocaleString(); }

const feedEl = document.getElementById('feed');
const navAvatar = document.getElementById('navAvatar');
const composeAvatar = document.getElementById('composeAvatar');
const sideAvatar = document.getElementById('sideAvatar');
const composeName = document.getElementById('composeName');
const sideName = document.getElementById('sideName');
const sideEmail = document.getElementById('sideEmail');
const sideDesc = document.getElementById('sideDesc');


let theme = localStorage.getItem('theme') || 'light-mode';
document.body.classList.add(theme);
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', ()=>{
  if(document.body.classList.contains('dark-mode')){
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    localStorage.setItem('theme','light-mode');
  } else {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme','dark-mode');
  }
});


function renderProfileFields(){
  const name = (currentUser.firstName||'') + (currentUser.lastName?(' '+currentUser.lastName):'');
  composeName.innerText = `Welcome, ${currentUser.firstName || 'User'}`;
  sideName.innerText = name || currentUser.email;
  sideEmail.innerText = currentUser.email || '';
  sideDesc.innerText = currentUser.description || '';
  [navAvatar, composeAvatar, sideAvatar].forEach(el=>{
    if(currentUser.profileImage){
      el.style.backgroundImage = `url(${currentUser.profileImage})`;
      el.style.backgroundSize = 'cover';
      el.innerText = '';
    } else {
      el.style.backgroundImage = '';
      el.innerText = (currentUser.firstName||'U').charAt(0).toUpperCase();
    }
  });
}

let currentSort = 'latest';

function renderPosts(){
  const q = (document.getElementById('searchInput').value||'').toLowerCase();
  let list = posts.slice();
  if(q) list = list.filter(p=>p.text.toLowerCase().includes(q) || (p.userName||'').toLowerCase().includes(q));

  if(currentSort==='latest') list.sort((a,b)=>b.id-a.id);
  else if(currentSort==='oldest') list.sort((a,b)=>a.id-b.id);
  else if(currentSort==='mostliked') list.sort((a,b)=>(b.likes||0)-(a.likes||0));

  feedEl.innerHTML='';
  if(list.length===0){ feedEl.innerHTML='<div class="empty">No posts yet.</div>'; return; }

  list.forEach(post=>{
    const div = document.createElement('div');
    div.className='post';

    let mainReaction = '';
    let youReacted = false;
    for(const key in post.reactions||{}){
      if(post.reactions[key].includes(currentUser.email)){
        mainReaction = key;
        youReacted = true;
        break;
      }
    }

    let totalReactions = 0;
    for(const key in post.reactions||{}) totalReactions += post.reactions[key].length;

    div.innerHTML=`
      <div class="post-head">
        <img src="${post.profileImage||''}" onerror="this.style.display='none'" class="avatar-sm" />
        <div>
          <div style="display:flex;align-items:center">
            <div class="post-name">${post.userName}</div>
            <div class="post-time">${formatTime(post.id)}</div>
          </div>
          <div class="small-muted" style="color:#667085;font-size:13px">${post.userEmail}</div>
        </div>
      </div>
      <div class="post-body">${post.text}</div>
      ${post.image? `<img src="${post.image}" onerror="this.style.display='none'" class="post-img" />` : ''}
      <div class="post-actions">
        <div class="actions-left">
          <button class="like-btn"  data-id="${post.id}">${mainReaction || '🤍'}</button>
          <div class="count" id="count-${post.id}" style="font-size:10px;">
            ${totalReactions > 0 ? (youReacted ? 'You' : '') + (youReacted && totalReactions>1 ? ' and '+(totalReactions-1)+' others' : '') + ` ${mainReaction}` : '0 likes'}
          </div>
        </div>
        <div class="owner-actions">
          ${post.userEmail===currentUser.email? `<button class="icon-btn edit-btn" data-id="${post.id}">✏️</button><button class="icon-btn delete-btn" data-id="${post.id}">🗑️</button>` : ''}
        </div>
      </div>
      
    `;
    feedEl.appendChild(div);
  });

  document.querySelectorAll('.like-btn').forEach(b=>{
    b.onclick = ()=> toggleLike(+b.dataset.id);
  });

  document.querySelectorAll('.delete-btn').forEach(b=>{
    b.onclick = ()=>{
      const id = +b.dataset.id;
      if(confirm('Delete this post?')){
        const idx = posts.findIndex(p=>p.id===id);
        if(idx>-1) posts.splice(idx,1);
        savePosts();
        renderPosts();
      }
    };
  });

  document.querySelectorAll('.edit-btn').forEach(b=>{
    b.onclick = ()=> openEdit(+b.dataset.id);
  });
}

function toggleLike(postId){
  const post = posts.find(p=>p.id===postId);
  if(!post) return;

  if(!post.reactions) post.reactions={};

  
  for(const key in post.reactions) post.reactions[key] = post.reactions[key].filter(e=>e!==currentUser.email);

  
  if(!post.reactions['❤️']) post.reactions['❤️'] = [];
  if(!post.reactions['❤️'].includes(currentUser.email)) post.reactions['❤️'].push(currentUser.email);

  
  let totalLikes = 0;
  for(const k in post.reactions) totalLikes += post.reactions[k].length;
  post.likes = totalLikes;

  savePosts();
  renderPosts();
}

document.getElementById('postQuick').addEventListener('click', ()=>{
  const text = (document.getElementById('quickText').value||'').trim();
  const image = (document.getElementById('quickImage').value||'').trim();
  if(!text) return alert('Post cannot be empty.');
  const newPost = {
    id: Date.now(),
    userEmail: currentUser.email,
    userName: (currentUser.firstName||'') + (currentUser.lastName?(' '+currentUser.lastName):''),
    profileImage: currentUser.profileImage || '',
    text,
    image,
    likes: 0,
    reactions: {}
  };
  posts.push(newPost);
  savePosts();
  document.getElementById('quickText').value='';
  document.getElementById('quickImage').value='';
  renderPosts();
});

let editingId = null;
function openEdit(id){
  editingId = id;
  const p = posts.find(x=>x.id===id);
  if(!p) return;
  document.getElementById('editText').value = p.text;
  document.getElementById('editImage').value = p.image || '';
  document.getElementById('editModal').style.display = 'flex';
}
document.getElementById('cancelEdit').onclick = ()=> document.getElementById('editModal').style.display='none';
document.getElementById('saveEdit').onclick = ()=>{
  const txt = document.getElementById('editText').value.trim();
  const img = document.getElementById('editImage').value.trim();
  const p = posts.find(x=>x.id===editingId);
  if(p){ p.text=txt; p.image=img; savePosts(); document.getElementById('editModal').style.display='none'; renderPosts(); }
};

document.getElementById('searchInput').addEventListener('input', renderPosts);
document.querySelectorAll('.chip').forEach(c=>{c.onclick = ()=>{document.querySelectorAll('.chip').forEach(x=>x.style.borderColor='#e6e9f2'); c.style.borderColor='#3b82f6'; currentSort = c.dataset.sort; renderPosts();};});
document.getElementById('logout').onclick = ()=>{ localStorage.removeItem('loggedInUser'); window.location='login.html';};
document.getElementById('previewBtn').addEventListener('click', ()=>{ const t = document.getElementById('quickText').value.trim(); const img = document.getElementById('quickImage').value.trim(); alert(`Preview:\n\n${t}${img?('\nImage: '+img):''}`); });

renderProfileFields();
renderPosts();