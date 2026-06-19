const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");
const loginRole = document.getElementById("loginRole");
const mobileInput = document.getElementById("mobile");
const ageInput = document.getElementById("age");

const toggleStudentFields = () => {
  const isStudent = loginRole.value === "student";
  mobileInput.style.display = isStudent ? "block" : "none";
  ageInput.style.display = isStudent ? "block" : "none";
  mobileInput.required = isStudent;
  ageInput.required = isStudent;
};

loginRole.addEventListener("change", toggleStudentFields);
toggleStudentFields();

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = loginRole.value;
  const mobile = mobileInput.value.trim();
  const age = ageInput.value;

  if (role === "student" && (!mobile || !age)) {
    loginMsg.textContent = "For student login, mobile and age are required.";
    return;
  }

  try {
    loginMsg.textContent = "Logging in...";
    const payload = { email, password };
    if (role === "student") {
      payload.mobile = mobile;
      payload.age = age;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    loginMsg.textContent = "Login successful. Redirecting...";

    if (data.user.role === "admin") {
      window.location.href = "/?role=admin";
      return;
    }
    if (data.user.role === "recruiter") {
      window.location.href = "/?role=recruiter";
      return;
    }
    window.location.href = "/?role=student";
  } catch (error) {
    loginMsg.textContent = error.message;
  }
});
