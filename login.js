


const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('loggedInUser')) {
        window.location.href = 'index.html'; 
    }
});


loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
        return alert('Please enter both email and password.');
    }

   
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return alert('Invalid email or password.');
    }

  
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');

    alert(`Welcome back, ${user.firstName}!`);
    window.location.href = 'index.html'; 
});


function logout() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}
