const registerForm = document.getElementById("registerForm");
const registerMsg = document.getElementById("registerMsg");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  try {
    registerMsg.textContent = "Creating account...";
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    registerMsg.textContent = "Registration successful. Redirecting to login...";
    window.location.href = "/login.html";
  } catch (error) {
    registerMsg.textContent = error.message;
  }
});
