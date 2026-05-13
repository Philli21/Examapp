import { useMemo, useState } from 'react';
import { WebView } from 'react-native-webview';

export type TextSegment =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string };

export function parseTextSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /\\\((.+?)\\\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'math', value: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

function htmlEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function LatexInline({ segments }: { segments: TextSegment[] }) {
  const [webHeight, setWebHeight] = useState(48);

  const html = useMemo(() => {
    let bodyHtml = '';
    for (const seg of segments) {
      if (seg.type === 'text') {
        bodyHtml += htmlEscape(seg.value);
      } else {
        bodyHtml += `\\(${seg.value}\\)`;
      }
    }

    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<style>
html, body { margin: 0; padding: 0; font-size: 22px; line-height: 1.5; word-break: break-word; }
.katex { font-size: 28px; display: inline; }
body { }
</style>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
</head>
<body>
<span>${bodyHtml}</span>
<script>
document.addEventListener("DOMContentLoaded", function() {
  renderMathInElement(document.body, {
    delimiters: [{ left: '\\\\(', right: '\\\\)', display: false }]
  });
  var h = document.body.scrollHeight || 40;
  window.ReactNativeWebView.postMessage(JSON.stringify({ height: h }));
});
</script>
</body>
</html>`;
  }, [segments]);

  return (
    <WebView
      style={{ height: webHeight, width: '100%', backgroundColor: 'transparent' }}
      source={{ html }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      onMessage={(e) => {
        try {
          const data = JSON.parse(e.nativeEvent.data);
          if (typeof data.height === 'number' && data.height > 0) {
            setWebHeight(data.height);
          }
        } catch {}
      }}
    />
  );
}

export function renderTextWithLatex(
  segments: TextSegment[],
  _textStyle?: object,
): React.ReactNode[] {
  return [<LatexInline key="inline" segments={segments} />];
}
