import './App.css';

// Key must match the one in content.ts.
const HYPE_KEY = 'local:hypeRemoved';

// A few example rewrites shown in the popup so the gag is self-explanatory
// without the visitor having to refresh a page first.
const EXAMPLES: Array<[string, string]> = [
  ['AI', 'Calculator'],
  ['artificial intelligence', 'Artificial Calculator'],
  ['ChatGPT', 'Chat Calc'],
  ['AGI', 'Artificial General Calculator'],
  ['LLM', 'Large Lossy Multiplication'],
  ['GPT', 'General Purpose Toaster'],
  ['AI-powered', 'Calculator-powered'],
  ['machine learning', 'memorizing'],
  ['deep learning', 'deep guessing'],
  ['neural network', 'tangled wire'],
  ['hallucination', 'feature'],
  ['prompt engineer', 'wish-maker'],
  ['generative', 'Hallucinating'],
  ['deepfake', 'deep forgery'],
];

function CalcIcon() {
  return (
    <svg
      className="header-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="8" y2="10.01" />
      <line x1="12" y1="10" x2="12" y2="10.01" />
      <line x1="16" y1="10" x2="16" y2="10.01" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="12" y1="14" x2="12" y2="14.01" />
      <line x1="16" y1="14" x2="16" y2="14.01" />
      <line x1="8" y1="18" x2="8" y2="18.01" />
      <line x1="12" y1="18" x2="12" y2="18.01" />
      <line x1="16" y1="18" x2="16" y2="18.01" />
    </svg>
  );
}

function App() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    storage.getItem<number>(HYPE_KEY, { fallback: 0 }).then((v) => setCount(v));
    const unwatch = storage.watch<number>(HYPE_KEY, (v) => setCount(v ?? 0));
    return unwatch;
  }, []);

  return (
    <div className="popup">
      <div className="header">
        <CalcIcon />
        <div className="header-text">
          <h1 className="title">
            AI <span className="arrow">&rarr;</span> Calculator
          </h1>
          <p className="subtitle">
            Every AI buzzword on the page, rewritten. Permanently.
          </p>
        </div>
      </div>

      <div className="counter" role="status" aria-live="polite">
        <span className="counter-num">
          {count === null ? '\u2014' : count.toLocaleString()}
        </span>
        <span className="counter-label">
          hype {count === 1 ? 'term' : 'terms'} removed
        </span>
      </div>

      <ul className="examples">
        {EXAMPLES.map(([from, to]) => (
          <li key={from}>
            <code className="from">{from}</code>
            <span className="arrow">&rarr;</span>
            <code className="to">{to}</code>
          </li>
        ))}
      </ul>

      <blockquote className="quote">
        &ldquo;I used to be surrounded by AI startups. Now I&rsquo;m surrounded
        by calculators. Much better.&rdquo;
        <cite>&mdash; definitely not a calculator</cite>
      </blockquote>

      <p className="footer">
        No AIs were harmed in the making of this extension &mdash; there were
        never any AIs.
      </p>
    </div>
  );
}

export default App;
