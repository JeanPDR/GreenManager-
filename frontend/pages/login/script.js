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
  const pontoSim = document.getElementById("ponto-sim");
  const pontoNao = document.getElementById("ponto-nao");
  const pontoColetaFields = document.getElementById("ponto-coleta-fields");
  const imagensEstabelecimento = document.getElementById(
    "imagens-estabelecimento"
  );

  pontoSim.addEventListener("change", togglePontoColetaFields);
  pontoNao.addEventListener("change", togglePontoColetaFields);

  function togglePontoColetaFields() {
    if (pontoSim.checked) {
      pontoColetaFields.style.display = "block";

      setPontoColetaFieldsRequired(true);
    } else {
      pontoColetaFields.style.display = "none";

      setPontoColetaFieldsRequired(false);
    }
  }

  function setPontoColetaFieldsRequired(isRequired) {
    document.getElementById("estabelecimento-nome").required = isRequired;
    document.getElementById("estabelecimento-endereco").required = isRequired;
    document.getElementById("estabelecimento-cep").required = isRequired;
    document.getElementById("tipo-ponto").required = isRequired;
    imagensEstabelecimento.required = isRequired;
  }

  document
    .getElementById("register-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;

      let pontoColeta = null;
      if (pontoSim.checked) {
        const nome = document.getElementById("estabelecimento-nome").value;
        const endereco = document.getElementById(
          "estabelecimento-endereco"
        ).value;
        const cep = document.getElementById("estabelecimento-cep").value;
        const tipoPonto = document.getElementById("tipo-ponto").value;

        const imagens = imagensEstabelecimento.files;
        if (imagens.length !== 4) {
          alert(
            "Por favor, selecione exatamente 4 imagens do estabelecimento."
          );
          return;
        }

        const imagensArray = [];
        let imagensProcessadas = 0;

        for (let i = 0; i < imagens.length; i++) {
          const leitorDeArquivos = new FileReader();
          leitorDeArquivos.onload = function (e) {
            imagensArray.push(e.target.result);
            imagensProcessadas++;
            if (imagensProcessadas === imagens.length) {
              pontoColeta = {
                nome,
                endereco,
                cep,
                tipoPonto,
                imagens: imagensArray,
              };
              realizarCadastro();
            }
          };
          leitorDeArquivos.readAsDataURL(imagens[i]);
        }
      } else {
        realizarCadastro();
      }

      function realizarCadastro() {
        mockRegisterAPI(email, password, pontoColeta).then((response) => {
          alert(response.message);
          if (response.success) {
            document.getElementById("register-form").reset();
            window.location.href = "/frontend/pages/home/";
          }
        });
      }
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
          window.location.href = "/frontend/pages/home/";
        }
      });
    });
}

function mockRegisterAPI(email, password, pontoColeta) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getUsers();
      const userExists = users.find((user) => user.email === email);
      if (userExists) {
        resolve({ success: false, message: "Usuário já cadastrado." });
      } else {
        const newUser = { email, password, pontoColeta };
        saveUser(newUser);
        resolve({ success: true, message: "Cadastro realizado com sucesso!" });
      }
    }, 500);
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
