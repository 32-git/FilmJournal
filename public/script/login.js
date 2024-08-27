const submitButton = document.querySelector("button");
const user = document.getElementById("input-username");
const pass = document.getElementById("input-password");

const changeForm = document.getElementById("change-form");
const logoText = document.querySelector("h1");
const errorText = document.getElementById("error-text");

submitButton.onclick = handleLogin;

user.onkeydown = pass.onkeydown = (e) => {
  if (e.keyCode == 13) {
    submitButton.onclick();
  }
};

function showRegisterForm() {
  logoText.innerHTML = 'Sign up for <br> <img id="logo" src="./img/logo.png">';
  document.getElementById("title-username").innerText = "New username";
  document.getElementById("title-password").innerText = "New password";
  submitButton.innerText = "Sign up";
  submitButton.onclick = handleRegister;

  changeForm.innerHTML = "Already a user? <a href='#'>Log in</a>";
  changeForm.dataset.attribute = "login";
}

function showLoginForm() {
  logoText.innerHTML = 'Log in to <br> <img id="logo" src="./img/logo.png">';
  document.getElementById("title-username").innerText = "Username";
  document.getElementById("title-password").innerText = "Password";
  submitButton.innerText = "Login";
  submitButton.onclick = handleLogin;

  changeForm.innerHTML = 'New user? <a href="#">Sign up</a>';
  changeForm.dataset.attribute = "register";
}

async function handleRegister() {
  if (user.value != "" && pass.value != "") {
    try {
      const response = await fetch("/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user.value, password: pass.value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(response);
        throw new Error(errorData.message || "Error registering user");
      }

      sessionStorage.setItem("username", user.value);
      location.replace("index.html");
    } catch (error) {
      console.error(error);
      errorText.innerHTML = error.message;
      errorText.classList.toggle("appear");
    }
  } else {
    errorText.innerHTML = "Please enter your details.";
    errorText.classList.toggle("appear");
  }
}

function handleLogin() {
  if (user.value != "") {
    fetch("/get-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user.value }),
    })
      .then((response) => response.json())
      .then((userData) => {
        if (pass.value == userData.password) {
          sessionStorage.setItem("username", user.value);
          location.replace("index.html");
        } else {
          errorText.innerHTML = "Invalid login details.";
          errorText.classList.toggle("appear");
        }
      })
      .catch((error) => console.error("Unable to fetch data:", error));
  } else if (user.value == "" || pass.value == "") {
    errorText.innerHTML = "Please enter your login details.";
    errorText.classList.toggle("appear");
  }
}

changeForm.onclick = (e) => {
  // Ensure the click came from the `a` element
  if (e.target.tagName === "A") {
    // Clear the error text upon changing the form
    errorText.innerHTML = "";
    errorText.classList.remove("appear");
    if (changeForm.dataset.attribute === "register") {
      showRegisterForm();
    } else {
      showLoginForm();
    }
  }
};
