const localAssistantReply = (message) => {
  const text = (message || "").toLowerCase();

  if (text.includes("apply") || text.includes("application")) {
    return "To apply for an internship, login as Student, open Home, and click Apply on a listing card. Track progress in Application Status where stages update in real time.";
  }
  if (text.includes("register") || text.includes("signup") || text.includes("sign up")) {
    return "Go to Register page, enter Name, Email, Password, and Role. After registration, login with the same credentials.";
  }
  if (text.includes("login") || text.includes("log in")) {
    return "Use the Login page with your Email and Password. After successful login, you are redirected based on role.";
  }
  if (text.includes("recruiter") || text.includes("post internship")) {
    return "Recruiters can post internships from Home after login. New posts are created as pending and need admin review.";
  }
  if (text.includes("admin") || text.includes("approve") || text.includes("reject")) {
    return "Admins can review internships and update application stages. Approved internships become visible on the public listing.";
  }
  if (text.includes("status") || text.includes("timeline")) {
    return "Application Status shows stages: Applied, Under Review, Shortlisted, Rejected, and Selected. Updates come in real time via Socket.IO.";
  }

  return "I am ready to help with InternConnect. You can ask about login/register, applying to internships, status tracking, recruiter posting, or admin approvals.";
};

const chatWithClaude = async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "messages array is required" });
    }

    if (!apiKey) {
      return res.status(200).json({
        reply: localAssistantReply(messages[messages.length - 1]?.content)
      });
    }

    const payloadMessages = messages.map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: entry.content
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 600,
        messages: payloadMessages
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const authError = data?.error?.type === "authentication_error";
      if (authError) {
        return res.status(200).json({
          reply: localAssistantReply(messages[messages.length - 1]?.content)
        });
      }

      return res.status(200).json({
        reply: localAssistantReply(messages[messages.length - 1]?.content)
      });
    }

    const reply = data.content?.[0]?.text || "I could not generate a response.";
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ message: "Chat request failed", error: error.message });
  }
};

module.exports = { chatWithClaude };
