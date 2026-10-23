// One real inference per invocation. Respect Retry-After; never automatically retry.
import { performance } from 'node:perf_hooks';
const endpoint = process.argv[2] || 'https://ai.bjjconnectionsbygabe.com/chat';
const question = process.argv[3] || 'What is a guard in BJJ?';
const started = performance.now();
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 65000);
let firstTextMs = null, characters = 0, completed = false;
try {
  const response = await fetch(endpoint, {
    method: 'POST', signal: controller.signal,
    headers: { Origin: 'https://bjjconnectionsbygabe.com', 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, stream: true })
  });
  const headersMs = performance.now() - started;
  const streaming = response.headers.get('Content-Type')?.includes('text/event-stream') || false;
  if (!response.ok) throw new Error(`HTTP ${response.status}; Retry-After=${response.headers.get('Retry-After') || 'none'}`);
  const textArrived = text => {
    if (!text) return;
    firstTextMs ??= performance.now() - started;
    characters += text.length;
  };
  if (streaming) {
    let buffer = '';
    const decoder = new TextDecoder();
    for await (const bytes of response.body) {
      buffer += decoder.decode(bytes, { stream: true });
      let match;
      while ((match = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        const data = frame.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (!data) continue;
        if (data === '[DONE]') { completed = true; break; }
        const event = JSON.parse(data);
        if (event.error || event.errors) throw new Error('Stream interrupted');
        if (typeof event.response === 'string') textArrived(event.response);
      }
      if (completed) break;
    }
  } else {
    const data = await response.json();
    if (typeof data.reply === 'string') { textArrived(data.reply); completed = true; }
  }
  console.log(JSON.stringify({ streaming, completed, headersMs: Math.round(headersMs), firstTextMs: firstTextMs === null ? null : Math.round(firstTextMs), totalMs: Math.round(performance.now() - started), characters }, null, 2));
  if (!completed || !characters) process.exitCode = 1;
} catch (error) {
  console.error(JSON.stringify({ error: error.message, elapsedMs: Math.round(performance.now() - started) }));
  process.exitCode = 1;
} finally { clearTimeout(timer); }
