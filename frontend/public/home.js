const internshipGrid = document.getElementById("internshipGrid");
const homeStatus = document.getElementById("homeStatus");
const searchCompany = document.getElementById("searchCompany");
const searchSkill = document.getElementById("searchSkill");
const searchDuration = document.getElementById("searchDuration");
const searchBtn = document.getElementById("searchBtn");
const recruiterPanel = document.getElementById("recruiterPanel");
const adminPanel = document.getElementById("adminPanel");
const internshipForm = document.getElementById("internshipForm");
const adminInternshipList = document.getElementById("adminInternshipList");
const applyModal = document.getElementById("applyModal");
const applyForm = document.getElementById("applyForm");
const cancelApplyBtn = document.getElementById("cancelApplyBtn");

let selectedInternshipId = "";

const fallbackListings = [
  {
    title: "Frontend Intern",
    company: "PixelCraft",
    duration: "3 months",
    stipend: "INR 20000/month",
    skillsRequired: ["React", "CSS"]
  },
  {
    title: "Backend Intern",
    company: "CoreStack",
    duration: "4 months",
    stipend: "INR 25000/month",
    skillsRequired: ["Node.js", "MongoDB"]
  },
  {
    title: "AI Intern",
    company: "NeuroGrid",
    duration: "6 months",
    stipend: "INR 30000/month",
    skillsRequired: ["Python", "PyTorch"]
  },
  {
    title: "Data Science Intern",
    company: "InsightMatrix",
    duration: "5 months",
    stipend: "INR 28000/month",
    skillsRequired: ["Pandas", "SQL"]
  },
  {
    title: "DevOps Intern",
    company: "DeployWave",
    duration: "4 months",
    stipend: "INR 26000/month",
    skillsRequired: ["Docker", "Kubernetes"]
  },
  {
    title: "Cloud Intern",
    company: "SkyScale",
    duration: "4 months",
    stipend: "INR 27000/month",
    skillsRequired: ["AWS", "Terraform"]
  }
];

const getToken = () => localStorage.getItem("token");
const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

const syncRolePanels = () => {
  const user = getUser();
  if (!user) {
    recruiterPanel.classList.add("hidden");
    adminPanel.classList.add("hidden");
    return;
  }

  if (user.role === "recruiter") {
    recruiterPanel.classList.remove("hidden");
  } else {
    recruiterPanel.classList.add("hidden");
  }

  if (user.role === "admin") {
    adminPanel.classList.remove("hidden");
    fetchAdminInternships();
  } else {
    adminPanel.classList.add("hidden");
  }
};

const renderCards = (items) => {
  if (!items.length) {
    internshipGrid.innerHTML = "<p>No internships found.</p>";
    return;
  }

  internshipGrid.innerHTML = items
    .map((item) => {
      const skills = (item.skillsRequired || []).map((s) => `<span class="skill">${s}</span>`).join("");
      return `
        <article class="card">
          <h3>${item.company} - ${item.title}</h3>
          <p><strong>Duration:</strong> ${item.duration}</p>
          <p><strong>Stipend:</strong> ${item.stipend}</p>
          <div class="skills">${skills}</div>
          <button class="apply-btn" data-id="${item._id || ""}" style="margin-top:10px;">Apply</button>
        </article>
      `;
    })
    .join("");
};

const buildQuery = () => {
  const params = new URLSearchParams();
  if (searchCompany.value.trim()) params.set("company", searchCompany.value.trim());
  if (searchSkill.value.trim()) params.set("skill", searchSkill.value.trim());
  if (searchDuration.value.trim()) params.set("duration", searchDuration.value.trim());
  return params.toString() ? `?${params.toString()}` : "";
};

const fetchInternships = async () => {
  try {
    homeStatus.textContent = "Loading internships...";
    const response = await fetch(`/api/internships${buildQuery()}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch internships");

    const listings = data.internships?.length ? data.internships : fallbackListings;
    renderCards(listings.slice(0, Math.max(listings.length, 6)));
    homeStatus.textContent = `Showing ${listings.length} internships`;
  } catch (error) {
    renderCards(fallbackListings);
    homeStatus.textContent = `Using sample listings due to error: ${error.message}`;
  }
};

const renderAdminInternships = (items) => {
  if (!items.length) {
    adminInternshipList.innerHTML = "<p>No pending internships.</p>";
    return;
  }

  adminInternshipList.innerHTML = items
    .map(
      (item) => `
      <article class="card">
        <h3>${item.company} - ${item.title}</h3>
        <p><strong>Status:</strong> ${item.status}</p>
        <div class="admin-actions">
          <button class="btn-approve" data-id="${item._id}" data-action="approve">Approve</button>
          <button class="btn-reject" data-id="${item._id}" data-action="reject">Reject</button>
          <button class="btn-delete" data-id="${item._id}" data-action="delete">Delete</button>
        </div>
      </article>
    `
    )
    .join("");
};

const fetchAdminInternships = async () => {
  const token = getToken();
  if (!token) return;
  try {
    const response = await fetch("/api/admin/internships", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch admin internships");
    const pending = (data.internships || []).filter((item) => item.status === "pending");
    renderAdminInternships(pending);
  } catch (error) {
    adminInternshipList.innerHTML = `<p>${error.message}</p>`;
  }
};

internshipGrid.addEventListener("click", async (event) => {
  const button = event.target.closest(".apply-btn");
  if (!button) return;
  const internshipId = button.getAttribute("data-id");
  const user = getUser();
  const token = getToken();

  if (!user || !token) {
    homeStatus.textContent = "Please login as Student to apply.";
    return;
  }
  if (user.role !== "student") {
    homeStatus.textContent = "Only students can apply to internships.";
    return;
  }
  if (!internshipId) {
    homeStatus.textContent = "Cannot apply to fallback sample card.";
    return;
  }

  selectedInternshipId = internshipId;
  applyForm.reset();
  applyModal.classList.remove("hidden");
});

cancelApplyBtn?.addEventListener("click", () => {
  selectedInternshipId = "";
  applyModal.classList.add("hidden");
});

applyForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = getToken();
  const user = getUser();

  if (!user || !token || user.role !== "student") {
    homeStatus.textContent = "Please login as Student to apply.";
    return;
  }

  if (!selectedInternshipId) {
    homeStatus.textContent = "Please select an internship again.";
    applyModal.classList.add("hidden");
    return;
  }

  const payload = new FormData();
  payload.append("name", document.getElementById("studentName").value.trim());
  payload.append("mobile", document.getElementById("studentMobile").value.trim());
  payload.append("email", document.getElementById("studentEmail").value.trim());
  payload.append("skills", document.getElementById("studentSkills").value.trim());

  const resumeInput = document.getElementById("studentResume");
  if (resumeInput.files && resumeInput.files[0]) {
    payload.append("resume", resumeInput.files[0]);
  }

  try {
    const response = await fetch(`/api/applications/${selectedInternshipId}/apply`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to apply");

    homeStatus.textContent = "Applied successfully. Check Application Status page.";
    selectedInternshipId = "";
    applyModal.classList.add("hidden");
  } catch (error) {
    homeStatus.textContent = error.message;
  }
});

searchBtn.addEventListener("click", fetchInternships);

internshipForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = getToken();
  if (!token) {
    homeStatus.textContent = "Please login as recruiter.";
    return;
  }

  const payload = {
    title: document.getElementById("title").value.trim(),
    company: document.getElementById("company").value.trim(),
    domain: document.getElementById("domain").value,
    description: document.getElementById("description").value.trim(),
    location: document.getElementById("location").value.trim(),
    stipend: document.getElementById("stipend").value.trim(),
    duration: document.getElementById("duration").value.trim(),
    skillsRequired: document
      .getElementById("skills")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  };

  try {
    const response = await fetch("/api/internships", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create internship");
    homeStatus.textContent = "Internship created as pending.";
    internshipForm.reset();
    fetchAdminInternships();
    fetchInternships();
  } catch (error) {
    homeStatus.textContent = error.message;
  }
});

adminInternshipList?.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  const id = button.getAttribute("data-id");
  const action = button.getAttribute("data-action");
  const token = getToken();
  if (!token) return;

  let url = `/api/admin/internships/${id}`;
  let method = "DELETE";
  if (action === "approve") {
    url = `/api/admin/internships/${id}/approve`;
    method = "PATCH";
  } else if (action === "reject") {
    url = `/api/admin/internships/${id}/reject`;
    method = "PATCH";
  }

  try {
    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Action failed");
    homeStatus.textContent = data.message;
    fetchAdminInternships();
    fetchInternships();
  } catch (error) {
    homeStatus.textContent = error.message;
  }
});

syncRolePanels();
fetchInternships();
