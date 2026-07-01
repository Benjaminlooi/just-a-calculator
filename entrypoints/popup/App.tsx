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

function App() {
  const [count, setCount] = useState<number | null>(null);

  // Read the running tally once, then watch storage so the number ticks up
  // live while the popup is open.
  useEffect(() => {
    storage.getItem<number>(HYPE_KEY, { fallback: 0 }).then((v) => setCount(v));
    const unwatch = storage.watch<number>(HYPE_KEY, (v) => setCount(v ?? 0));
    return unwatch;
  }, []);

  return (
    <div className="popup">
      <h1 className="title">
        AI <span className="arrow">→</span> Calculator
      </h1>

      <p className="subtitle">
        Every AI buzzword on the page, rewritten. Permanently.
      </p>

      <div className="counter">
        <span className="counter-num">
          {count === null ? '—' : count.toLocaleString()}
        </span>
        <span className="counter-label">
          hype {count === 1 ? 'term' : 'terms'} removed
        </span>
      </div>

      <ul className="examples">
        {EXAMPLES.map(([from, to]) => (
          <li key={from}>
            <code className="from">{from}</code>
            <span className="arrow">→</span>
            <code className="to">{to}</code>
          </li>
        ))}
      </ul>

      <blockquote className="quote">
        “I used to be surrounded by AI startups. Now I’m surrounded by
        calculators. Much better.”
        <cite>— definitely not a calculator</cite>
      </blockquote>

      <p className="footer">
        No AIs were harmed in the making of this extension — there were never
        any AIs.
      </p>
    </div>
  );
}

export default App;
