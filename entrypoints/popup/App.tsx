import './App.css';

function App() {
  return (
    <div className="popup">
      <h1 className="title">
        AI <span className="arrow">→</span> Calculator
      </h1>
      <p className="subtitle">
        Every instance of <code className="from">AI</code>,{' '}
        <code className="from">ai</code>, or <code className="from">A.I</code>{' '}
        on a page is rewritten to <code className="to">Calculator</code>,
        matching the original casing.
      </p>
      <p className="hint">It runs automatically on every site you visit.</p>
    </div>
  );
}

export default App;
