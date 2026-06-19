const timelineRoot = document.getElementById("timelineRoot");
const statusPageNote = document.getElementById("statusPageNote");
const statusStages = ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"];

const badgeClass = (stage) => {
  switch (stage) {
    case "Applied":
      return "applied";
    case "Under Review":
      return "under-review";
    case "Shortlisted":
      return "shortlisted";
    case "Selected":
      return "selected";
    case "Rejected":
      return "rejected";
    default:
      return "applied";
  }
};

const getAuth = () => ({
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null")
});

const renderStudentApplications = (applications) => {
  if (!applications.length) {
    timelineRoot.innerHTML = "<p>No applications found.</p>";
    return;
  }

  timelineRoot.innerHTML = applications
    .map((application) => {
      const internship = application.internship || {};
      const stageBadges = statusStages
        .map(
          (stage) =>
            `<span class="badge ${badgeClass(stage)}" style="opacity:${stage === application.status ? "1" : "0.35"}">${stage}</span>`
        )
        .join("");

      return `
        <article class="card">
          <h3>${internship.company || "Company"} - ${internship.title || "Internship"}</h3>
          <p><strong>Current Stage:</strong> ${application.status}</p>
          <p>
            <strong>Applicant:</strong> ${application.applicantSnapshot?.name || "-"} |
            <strong>Email:</strong> ${application.applicantSnapshot?.email || "-"} |
            <strong>Mobile:</strong> ${application.applicantSnapshot?.mobile || "-"} |
            <strong>Age:</strong> ${application.applicantSnapshot?.age ?? "-"}
          </p>
          <div class="stage-list">${stageBadges}</div>
        </article>
      `;
    })
    .join("");
};

const renderReviewApplications = (applications) => {
  if (!applications.length) {
    timelineRoot.innerHTML = "<p>No student applications to review.</p>";
    return;
  }

  timelineRoot.innerHTML = applications
    .map((application) => {
      const internship = application.internship || {};
      const applicant = application.applicantSnapshot || {};
      const stageBadges = statusStages
        .map(
          (stage) =>
            `<span class="badge ${badgeClass(stage)}" style="opacity:${stage === application.status ? "1" : "0.35"}">${stage}</span>`
        )
        .join("");

      return `
        <article class="card">
          <h3>${internship.company || "Company"} - ${internship.title || "Internship"}</h3>
          <p><strong>Current Stage:</strong> ${application.status}</p>
          <p>
            <strong>Student:</strong> ${applicant.name || "-"} |
            <strong>Email:</strong> ${applicant.email || "-"} |
            <strong>Mobile:</strong> ${applicant.mobile || "-"}
          </p>
          <p>
            <strong>Skills:</strong> ${(applicant.skills || []).join(", ") || "-"}
          </p>
          <p>
            <strong>Resume:</strong>
            ${
              applicant.resumeFile
                ? `<a href="${applicant.resumeFile}" target="_blank" rel="noopener noreferrer">View Resume</a>`
                : "Not uploaded"
            }
          </p>
          <div class="stage-list">${stageBadges}</div>
          <div class="admin-actions">
            <button class="btn-approve review-status-btn" data-id="${application._id}" data-status="Selected">Accept</button>
            <button class="btn-reject review-status-btn" data-id="${application._id}" data-status="Rejected">Reject</button>
            <button class="btn-delete review-status-btn" data-id="${application._id}" data-status="Under Review">Under Review</button>
          </div>
        </article>
      `;
    })
    .join("");
};

const fetchMyApplications = async () => {
  const { token, user } = getAuth();
  if (!token || !user) {
    statusPageNote.textContent = "Please login as student to view application timeline.";
    renderStudentApplications([]);
    return;
  }

  try {
    const response = await fetch("/api/applications/my", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load applications");
    }
    renderStudentApplications(data.applications || []);
  } catch (error) {
    statusPageNote.textContent = error.message;
  }
};

const fetchReviewApplications = async () => {
  const { token } = getAuth();
  try {
    const response = await fetch("/api/applications/review", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load applications for review");
    }
    renderReviewApplications(data.applications || []);
  } catch (error) {
    statusPageNote.textContent = error.message;
  }
};

timelineRoot.addEventListener("click", async (event) => {
  const button = event.target.closest(".review-status-btn");
  if (!button) return;

  const { token } = getAuth();
  if (!token) {
    statusPageNote.textContent = "Session expired. Please login again.";
    return;
  }

  const applicationId = button.getAttribute("data-id");
  const status = button.getAttribute("data-status");
  if (!applicationId || !status) {
    statusPageNote.textContent = "Invalid application action. Refresh and try again.";
    return;
  }

  statusPageNote.textContent = `Updating application to ${status}...`;
  button.disabled = true;

  try {
    const response = await fetch(`/api/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to update status");
    }
    statusPageNote.textContent = data.message || `Application moved to ${status}`;
    await fetchReviewApplications();
  } catch (error) {
    statusPageNote.textContent = `Status update failed: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});

const setupRealtime = () => {
  const { user } = getAuth();
  if (!user) return;

  const socket = io();
  socket.emit("join-user-room", user.id);
  socket.on("application:status-updated", () => {
    statusPageNote.textContent = "Application status updated in real time.";
    if (user.role === "student") {
      fetchMyApplications();
    }
  });
};

setupRealtime();
const { user } = getAuth();
if (!user) {
  statusPageNote.textContent = "Please login to continue.";
  renderStudentApplications([]);
} else if (user.role === "student") {
  statusPageNote.textContent = "Track your applications in real time.";
  fetchMyApplications();
} else if (user.role === "recruiter" || user.role === "admin") {
  statusPageNote.textContent = "Review student applications and update status.";
  fetchReviewApplications();
} else {
  statusPageNote.textContent = "Unauthorized role.";
  renderStudentApplications([]);
}
