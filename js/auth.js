import { getTechnicians } from "./localStorageManager.js";
import { DEFAULT_PASSWORD } from "./constants.js";

let onLoginSuccessCallbackInternal;

export function setupLoginForm(
  loginForm,
  usuarioInput,
  senhaInput,
  onLoginSuccess
) {
  if (!loginForm || !usuarioInput || !senhaInput) {
    console.error(
      "AUTH.JS - setupLoginForm: Elementos do formulário de login ausentes."
    );
    return;
  }

  onLoginSuccessCallbackInternal = onLoginSuccess;

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const usernameTyped = usuarioInput.value.trim();
    const passwordTyped = senhaInput.value;

    const technicians = getTechnicians();
    const foundTechnician = technicians.find(
      (tech) => tech.usuario.toLowerCase() === usernameTyped.toLowerCase()
    );

    if (foundTechnician && passwordTyped === DEFAULT_PASSWORD) {
      localStorage.setItem("loggedInUserName", foundTechnician.nome);
      console.log(`AUTH.JS - Login BEM-SUCEDIDO para: ${foundTechnician.nome}`);
      if (typeof onLoginSuccessCallbackInternal === "function") {
        onLoginSuccessCallbackInternal();
      }
    } else {
      alert("Usuário ou senha inválidos.");
      console.warn("AUTH.JS - Login FALHOU.");
    }
  });
}

export function performUserLogout(navigationCallback) {
  console.log("AUTH.JS - performUserLogout: Executando logout.");
  localStorage.removeItem("loggedInUserName");

  if (typeof navigationCallback === "function") {
    navigationCallback();
  }
}

export function checkAuthStatus() {
  return localStorage.getItem("loggedInUserName") !== null;
}

export function getLoggedInUserName() {
  return localStorage.getItem("loggedInUserName");
}

export function getLoginScreenHTML() {
  return `
    <div class="login-screen-container">
      <form id="loginForm" class="login-form">
        <div class="login-header">
          <img src="https://via.placeholder.com/80x80?text=LOGO" alt="Logo" class="logo">
          <h2>RELAPRO - Controle de Ordens de Serviço</h2>
          
        </div>
        <div class="form-group">
          <label for="usuario">Usuário:</label>
          <input type="text" id="usuario" placeholder="Digite seu usuário" required>
        </div>
        <div class="form-group">
          <label for="senha">Senha:</label>
          <input type="password" id="senha" placeholder="Digite sua senha" required>
        </div>
        <button type="submit" class="btn-login">Entrar</button>
        <div class="login-footer">
          <p>Problemas para acessar? <a href="#">Contate o administrador</a></p>
        </div>
      </form>
    </div>
  `;
}
