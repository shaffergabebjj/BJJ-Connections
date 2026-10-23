(() => {
  'use strict';
  const RESPONSE_TIMEOUT_MS = 60000;
  const endpoint = window.BJJ_AI_CONFIG?.endpoint;
  if (!endpoint || document.getElementById('bjj-ai-dialog')) return;
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return;
  } catch { return; }
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const launch = make('button', 'bjj-ai-launch', 'Ask BJJ AI');
  launch.type = 'button';
  launch.setAttribute('aria-haspopup', 'dialog');
  launch.setAttribute('aria-controls', 'bjj-ai-dialog');
  const dialog = make('dialog', 'bjj-ai-dialog');
  dialog.id = 'bjj-ai-dialog';
  dialog.setAttribute('aria-labelledby', 'bjj-ai-title');
  const header = make('header', 'bjj-ai-header');
  const title = make('h2', '', 'Ask BJJ AI'); title.id = 'bjj-ai-title';
  const close = make('button', 'bjj-ai-close', 'Close'); close.type = 'button';
  header.append(title, close);
  const intro = make('p', 'bjj-ai-intro', 'BJJ terms, positions and scoring—one question at a time.');
  const disclosure = make('p', 'bjj-ai-disclosure', 'AI can make mistakes. Check official event rules and ask your coach. Questions are sent to Cloudflare AI; avoid personal information.');
  const examples = make('div', 'bjj-ai-examples');
  for (const question of ['What is guard retention?', 'How is a sweep different from a reversal?']) {
    const button = make('button', '', question); button.type = 'button';
    button.addEventListener('click', () => { input.value = question; input.focus(); });
    examples.append(button);
  }
  const output = make('div', 'bjj-ai-output', 'What would you like to learn?');
  output.setAttribute('role', 'status'); output.setAttribute('aria-live', 'polite');
  output.setAttribute('aria-atomic', 'true');
  const form = make('form', 'bjj-ai-form');
  const label = make('label', '', 'Your BJJ question'); label.htmlFor = 'bjj-ai-question';
  const input = make('textarea'); input.id = 'bjj-ai-question'; input.required = true;
  input.maxLength = 1000; input.rows = 3; input.placeholder = 'Ask a question…';
  const send = make('button', 'bjj-ai-send', 'Ask'); send.type = 'submit';
  const stop = make('button', 'bjj-ai-stop', 'Stop response'); stop.type = 'button'; stop.hidden = true;
  const status = make('p', 'bjj-ai-connection'); status.setAttribute('role', 'status');
  const resources = make('a', '', 'Browse BJJ resources'); resources.href = '/resources.html';
  form.append(label, input, send, stop);
  dialog.append(header, intro, examples, output, form, status, disclosure, resources);
  document.body.append(launch, dialog);
  let busy = false, retryAt = 0, cooldownTimer, activeController, cancelReason = '', phase = '';
  function cancel(reason) {
    if (!activeController) return;
    cancelReason = reason;
    activeController.abort();
  }
  stop.addEventListener('click', () => cancel('stopped'));
  function update() {
    const offline = navigator.onLine === false;
    const seconds = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
    send.disabled = busy || offline || seconds > 0;
    send.textContent = busy ? (phase === 'generating' ? 'Generating…' : 'Thinking…') : 'Ask';
    stop.hidden = !busy;
    status.textContent = offline ? 'You’re offline. Reconnect to ask the AI.' : seconds ? `Please wait ${seconds}s before asking again.` : busy ? (phase === 'generating' ? 'Generating answer…' : 'Waiting for the AI…') : '';
    if (!seconds && cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = undefined; }
  }
  launch.addEventListener('click', () => { dialog.showModal(); update(); input.focus(); });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { cancel('stopped'); launch.focus(); });
  window.addEventListener('online', update);
  window.addEventListener('offline', () => { cancel('offline'); update(); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || navigator.onLine === false || Date.now() < retryAt) return;
    const question = input.value.trim();
    if (!question) { input.setCustomValidity('Please enter a question.'); input.reportValidity(); return; }
    input.setCustomValidity('');
    busy = true; phase = 'waiting'; cancelReason = ''; update();
    // Hold live-region announcements until completion instead of rereading every token.
    output.setAttribute('aria-busy', 'true');
    output.textContent = 'Thinking…';
    const controller = new AbortController(); activeController = controller;
    let timeout, reader, reply = '';
    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => cancel('timeout'), RESPONSE_TIMEOUT_MS);
    };
    resetTimeout();
    const append = text => {
      if (!text) return;
      if (reply.length + text.length > 16000) throw new Error('The answer exceeded the display limit. Please ask a shorter question.');
      reply += text;
      // Never interpret AI-generated text as HTML.
      output.textContent = reply;
      if (phase !== 'generating') { phase = 'generating'; update(); }
      resetTimeout();
    };
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'omit', cache: 'no-store', signal: controller.signal,
        body: JSON.stringify({ question, stream: true })
      });
      if (response.status === 429) {
        const seconds = Math.min(300, Math.max(1, Number(response.headers.get('Retry-After')) || 60));
        retryAt = Date.now() + seconds * 1000;
        cooldownTimer = setInterval(update, 1000);
        throw new Error('Too many questions. Please wait before trying again.');
      }
      if (!response.ok) throw new Error(response.status === 503 ? 'AI is unavailable or its daily allowance is used up. Try again later.' : 'The assistant could not answer. Please try again later.');
      if (response.headers?.get('Content-Type')?.includes('text/event-stream')) {
        if (!response.body?.getReader) throw new Error('Streaming is unavailable in this browser. Please try an updated browser.');
        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '', complete = false;
        while (!complete) {
          const { value, done } = await reader.read();
          if (controller.signal.aborted) throw new Error('Cancelled');
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let match;
          while ((match = /\r?\n\r?\n/.exec(buffer))) {
            const frame = buffer.slice(0, match.index);
            buffer = buffer.slice(match.index + match[0].length);
            const data = frame.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
            if (!data) continue;
            if (data === '[DONE]') { complete = true; break; }
            let event;
            try { event = JSON.parse(data); } catch { throw new Error('The answer was interrupted. Please try again.'); }
            if (event.error || event.errors) throw new Error('The answer was interrupted. Please try again.');
            if (typeof event.response === 'string') append(event.response);
          }
          if (buffer.length > 65536) throw new Error('The answer was interrupted. Please try again.');
        }
        if (!complete) throw new Error('The answer was interrupted. Please try again.');
      } else {
        // Keep deployment order safe: the previous Worker returns JSON.
        const data = await response.json();
        if (controller.signal.aborted) throw new Error('Cancelled');
        if (typeof data.reply === 'string') append(data.reply);
      }
      if (!reply.trim()) throw new Error('No answer arrived. Please try again.');
    } catch (error) {
      const message = cancelReason === 'stopped' ? 'Response stopped.'
        : cancelReason === 'offline' ? 'Connection lost. Reconnect and try again.'
        : cancelReason === 'timeout' || error.name === 'AbortError' ? 'That took too long without a response. Please try again.'
        : error instanceof TypeError ? 'Could not connect. Check your connection and try again.' : error.message;
      output.textContent = reply ? `${reply}\n\n[${message} This answer may be incomplete.]` : message;
    } finally {
      clearTimeout(timeout);
      // Cancel unread upstream data on errors, stop, or an early completion marker.
      if (reader) { await reader.cancel().catch(() => {}); reader.releaseLock(); }
      activeController = undefined; busy = false; update();
      output.setAttribute('aria-busy', 'false');
      if (cancelReason === 'stopped' && dialog.open) send.focus();
    }
  });
  input.addEventListener('input', () => input.setCustomValidity(''));
})();
