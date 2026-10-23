// Normalize Workers AI SSE to text-only events; never forward provider diagnostics.
export function textStream(upstream) {
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '', finished = false;
  const encode = value => encoder.encode(`data: ${typeof value === 'string' ? value : JSON.stringify(value)}\n\n`);
  return new ReadableStream({
    async pull(controller) {
      try {
        while (!finished) {
          let emitted = false;
          const { value, done } = await reader.read();
          if (done) throw new Error('Incomplete stream');
          buffer += decoder.decode(value, { stream: true });
          let match;
          while ((match = /\r?\n\r?\n/.exec(buffer))) {
            const frame = buffer.slice(0, match.index);
            buffer = buffer.slice(match.index + match[0].length);
            const data = frame.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
            if (!data) continue;
            if (data === '[DONE]') {
              finished = true;
              controller.enqueue(encode('[DONE]'));
              controller.close();
              await reader.cancel().catch(() => {});
              return;
            }
            const event = JSON.parse(data);
            if (event.error || event.errors) throw new Error('Provider error');
            if (typeof event.response === 'string' && event.response) {
              controller.enqueue(encode({ response: event.response }));
              emitted = true;
            }
          }
          if (buffer.length > 65536) throw new Error('Oversized event');
          if (emitted) return;
        }
      } catch {
        if (!finished) {
          finished = true;
          controller.enqueue(encode({ error: 'The answer was interrupted. Please try again.' }));
          controller.close();
          await reader.cancel().catch(() => {});
        }
      }
    },
    async cancel(reason) { finished = true; await reader.cancel(reason).catch(() => {}); }
  });
}
