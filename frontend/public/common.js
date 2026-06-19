const NAV_ITEMS = [
  { label: "Home", href: "/", hasCaret: true },
  { label: "Login", href: "/login.html", hasCaret: true },
  { label: "Register", href: "/register.html", hasCaret: true },
  { label: "Application Status", href: "/status.html", hasCaret: true }
];

const getStoredUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

const buildNavbar = () => {
  const root = document.getElementById("navbarRoot");
  if (!root) return;

  const path = window.location.pathname;
  const user = getStoredUser();
  root.innerHTML = `
    <header class="topbar">
      <div class="nav-wrap">
        <a class="brand" href="/">
          <span class="brand-mark" aria-hidden="true"></span>
          <span class="brand-text">
            <strong>INTERN</strong>
            <span>CONNECT</span>
          </span>
        </a>
        <nav id="navLinks" class="nav-links">
          ${NAV_ITEMS.map(
            (item) =>
              `<a class="${path === item.href ? "active" : ""}" href="${item.href}">
                ${item.label}${item.hasCaret ? '<span class="caret">▾</span>' : ""}
              </a>`
          ).join("")}
          <a class="login-cta ${path === "/login.html" ? "active-cta" : ""}" href="/login.html">
            Login/Signup <span class="arrow">➜</span>
          </a>
          ${user ? '<button id="logoutBtnNav" class="logout-cta" type="button">Logout</button>' : ""}
        </nav>
      </div>
    </header>
  `;

  const logoutBtn = document.getElementById("logoutBtnNav");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login.html";
    });
  }
};

const renderChatMessages = (container, messages) => {
  container.innerHTML = messages
    .map((entry) => `<div class="msg ${entry.role === "user" ? "user" : "ai"}">${entry.content}</div>`)
    .join("");
  container.scrollTop = container.scrollHeight;
};

const setupChatbot = () => {
  const root = document.getElementById("chatbotRoot");
  if (!root) return;

  root.innerHTML = `
    <button class="chatbot-fab" id="chatFab" aria-label="Open chatbot">💬</button>
    <section class="chatbox" id="chatbox">
      <div class="chat-head">InternConnect AI Assistant</div>
      <div class="chat-body" id="chatBody"></div>
      <div class="chat-input">
        <input id="chatInput" placeholder="Ask anything..." />
        <button id="chatSend" type="button">Send</button>
      </div>
    </section>
  `;

  const fab = document.getElementById("chatFab");
  const chatbox = document.getElementById("chatbox");
  const chatBody = document.getElementById("chatBody");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");
  const typingId = "chatTyping";
  let messages = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");

  renderChatMessages(chatBody, messages);

  fab.addEventListener("click", () => {
    chatbox.classList.toggle("open");
  });

  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    messages.push({ role: "user", content: text });
    sessionStorage.setItem("chatHistory", JSON.stringify(messages));
    renderChatMessages(chatBody, messages);
    chatInput.value = "";

    const typing = document.createElement("div");
    typing.id = typingId;
    typing.className = "typing";
    typing.textContent = "Claude is typing...";
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Chat request failed");
      }

      messages.push({ role: "assistant", content: data.reply });
      sessionStorage.setItem("chatHistory", JSON.stringify(messages));
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      renderChatMessages(chatBody, messages);
    } catch (error) {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      messages.push({ role: "assistant", content: `Error: ${error.message}` });
      sessionStorage.setItem("chatHistory", JSON.stringify(messages));
      renderChatMessages(chatBody, messages);
    }
  };

  chatSend.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendMessage();
  });
};

const setupAuthHint = () => {
  const user = getStoredUser();
  const target = document.getElementById("authHint");
  if (!target) return;

  if (!user) {
    target.textContent = "You are browsing as guest.";
    return;
  }
  target.textContent = `Logged in as ${user.name} (${user.role})`;
};

buildNavbar();
setupChatbot();
setupAuthHint();
