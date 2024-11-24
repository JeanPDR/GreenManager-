// Função para obter usuários do localStorage
function getUsers() {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
}

if (document.getElementById("register-form")) {
  document
    .getElementById("register-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("register-name").value;
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;
      const confirmPassword = document.getElementById(
        "register-confirm-password"
      ).value;
      const isPontoColeta = document.getElementById("ponto-sim").checked;

      if (password !== confirmPassword) {
        alert("As senhas não correspondem. Por favor, tente novamente.");
        return;
      }

      const userData = {
        name,
        email,
        password,
        isPontoColeta,
      };

      realizarCadastro(userData);
    });
}

function realizarCadastro(userData) {
  mockRegisterAPI(userData).then((response) => {
    alert(response.message);
    if (response.success) {
      document.getElementById("register-form").reset();
      window.location.href = "/frontend/pages/home/";
    }
  });
}

function mockRegisterAPI(userData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getUsers();
      const userExists = users.find((user) => user.email === userData.email);
      if (userExists) {
        resolve({ success: false, message: "Usuário já cadastrado." });
      } else {
        saveUser(userData);
        resolve({ success: true, message: "Cadastro realizado com sucesso!" });
      }
    }, 500);
  });
}

if (document.getElementById("login-form")) {
  document
    .getElementById("login-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      mockLoginAPI(email, password).then((response) => {
        alert(response.message);
        if (response.success) {
          localStorage.setItem("currentUserEmail", email);
          window.location.href = "/frontend/pages/home/";
        }
      });
    });
}

function mockLoginAPI(email, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getUsers();
      const user = users.find(
        (user) => user.email === email && user.password === password
      );
      if (user) {
        resolve({ success: true, message: "Login realizado com sucesso!" });
      } else {
        resolve({ success: false, message: "Email ou senha incorretos." });
      }
    }, 500);
  });
}
