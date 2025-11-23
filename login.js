  document.getElementById('loginBtn').addEventListener('click', () => {
    const email = (document.getElementById('email').value || '').trim().toLowerCase();
    const password = document.getElementById('password').value;
    if(!email || !password) return alert('All fields required.');

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const u = users.find(x => x.email === email && x.password === password);
    if(!u) return alert('Invalid credentials.');
    localStorage.setItem('loggedInUser', JSON.stringify(u));
    window.location = 'index.html';
  });