(function () {
  const endpoint = "https://chat.bjjconnectionsbygabe.com/chat";
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const send = document.getElementById("chatSend");
  const messages = document.getElementById("chatMessages");
  const status = document.getElementById("chatStatus");
  const history = [];

  function addMessage(text, role) {
    const item = document.createElement("div");
    item.className = "ask-message ask-" + role;
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }

  async function ask(question) {
    if (send.disabled || !question.trim()) return;
    question = question.trim();
    addMessage(question, "user");
    input.value = "";
    send.disabled = true;
    input.disabled = true;
    status.textContent = "Thinking…";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history.slice(-6), { role: "user", content: question }] }),
        signal: AbortSignal.timeout(25000)
      });
      const data = await response.json();
      if (!response.ok || typeof data.answer !== "string") throw new Error(data.error || "Chat is unavailable right now.");
      addMessage(data.answer, "assistant");
      history.push({ role: "user", content: question }, { role: "assistant", content: data.answer.slice(0, 500) });
      status.textContent = "Ready for a question";
    } catch (error) {
      addMessage(error.message === "Failed to fetch" ? "Chat is being set up. Please try again later." :
        error.name === "TimeoutError" ? "That took too long. Please try again." : error.message, "error");
      status.textContent = "Could not answer";
    } finally {
      send.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    ask(input.value);
  });
  document.querySelectorAll("[data-question]").forEach(button => {
    button.addEventListener("click", () => ask(button.dataset.question));
  });
})();
