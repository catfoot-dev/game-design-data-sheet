import { useEffect } from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown-light.css';

export default function Doc() {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('https://github.com/catfoot-dev/game-design-data-sheet/blob/main/README.md?raw=true');
      setMarkdown(await res.text());
    })();
  }, []);
  
  return (
    <div className="markdown-body flex flex-col p-5 overflow-y-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
