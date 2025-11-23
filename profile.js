// ---------- LOGIN CHECK ----------
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
    alert("You must login first!");
    window.location.href = "login.html";
}

// ---------- LOCAL STORAGE INITIALIZATION ----------
let profile = {
    firstName: loggedInUser.firstName || "User",
    lastName: loggedInUser.lastName || "",
    email: loggedInUser.email || "",
    profileImage: loggedInUser.profileImage || "",
    description: loggedInUser.description || ""
};

// ---------- ELEMENTS ----------
const welcomeName = document.getElementById("welcomeName");
const welcomeEmail = document.getElementById("welcomeEmail");
const userDesc = document.getElementById("userDesc");
const profileImage = document.getElementById("profileImage");
const popup = document.getElementById("editPopup");
const editBtn = document.getElementById("editProfileBtn");
const cancelBtn = document.getElementById("cancelBtn");
const closePopup = document.getElementById("closePopup");
const saveBtn = document.getElementById("saveBtn");
const uploadPhoto = document.getElementById("uploadPhoto");
const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const editDesc = document.getElementById("editDesc");
const goHome = document.getElementById("goHome");

// ---------- FUNCTIONS ----------
function updateProfileUI() {
    welcomeName.innerText = `Welcome, ${profile.firstName} ${profile.lastName}`;
    welcomeEmail.innerText = profile.email;
    userDesc.innerText = profile.description || "This is your profile description...";
    profileImage.src = profile.profileImage || "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";
}

// Initial render
updateProfileUI();

// ---------- OPEN MODAL ----------
editBtn.addEventListener("click", () => {
    editName.value = `${profile.firstName} ${profile.lastName}`.trim();
    editEmail.value = profile.email;
    editDesc.value = profile.description;
    popup.classList.add("show");
});

// ---------- CLOSE MODAL ----------
cancelBtn.addEventListener("click", () => popup.classList.remove("show"));
closePopup.addEventListener("click", () => popup.classList.remove("show"));

// ---------- SAVE PROFILE ----------
saveBtn.addEventListener("click", () => {
    // Split name into firstName and lastName
    const nameParts = (editName.value || "").trim().split(" ");
    profile.firstName = nameParts[0] || profile.firstName;
    profile.lastName = nameParts.slice(1).join(" ") || profile.lastName;

    profile.email = editEmail.value.trim() || profile.email;
    profile.description = editDesc.value.trim() || profile.description;

    // Save updated profile
    localStorage.setItem("loggedInUser", JSON.stringify(profile));

    // Update users array
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let index = users.findIndex(u => u.email === profile.email);
    if(index !== -1){
        users[index] = profile;
        localStorage.setItem("users", JSON.stringify(users));
    }

    updateProfileUI();
    popup.classList.remove("show");
});

// ---------- UPLOAD PHOTO ----------
uploadPhoto.addEventListener("change", () => {
    let file = uploadPhoto.files[0];
    if(file) {
        profile.profileImage = URL.createObjectURL(file);
        localStorage.setItem("loggedInUser", JSON.stringify(profile));
        updateProfileUI();
    }
});

// ---------- GO HOME ----------
goHome.addEventListener("click", () => {
    window.location.href = "index.html";
});
