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
      role="img"
      aria-label="Calculator icon"
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
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    storage.getItem<number>(HYPE_KEY, { fallback: 0 }).then((v) => setCount(v));
    const unwatchCount = storage.watch<number>(HYPE_KEY, (v) => setCount(v ?? 0));

    storage.getItem<boolean>('local:isEnabled', { fallback: true }).then((v) => setIsEnabled(v));
    const unwatchEnabled = storage.watch<boolean>('local:isEnabled', (v) => setIsEnabled(v ?? true));

    return () => {
      unwatchCount();
      unwatchEnabled();
    };
  }, []);

  const handleToggle = async () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    await storage.setItem('local:isEnabled', nextState);
  };

  return (
    <div className="popup">
      <div className="header">
        <div className="header-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          <button
            role="switch"
            aria-checked={isEnabled}
            className={`toggle-switch ${isEnabled ? 'active' : ''}`}
            onClick={handleToggle}
            aria-label="Toggle extension functionality"
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      {!isEnabled && (
        <div className="reload-notice" role="status">
          Extension disabled. Refresh pages to restore AI terms.
        </div>
      )}

      <div className={isEnabled ? '' : 'disabled-container'}>
        <div className="counter" role="status" aria-live="polite" aria-busy={count === null}>
          <span className="counter-num">
            {count === null ? '\u2014' : count.toLocaleString()}
          </span>
          <span className="counter-label">
            hype {count === 1 ? 'term' : 'terms'} removed
          </span>
        </div>

        <ul className="examples" aria-label="Example term rewrites">
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
      </div>

      <p className="footer">
        No AIs were harmed in the making of this extension &mdash; there were
        never any AIs.
      </p>
    </div>
  );
}

export default App;
