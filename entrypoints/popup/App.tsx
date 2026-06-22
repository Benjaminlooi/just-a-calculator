import './App.css';

function App() {
  return (
    <div className="popup">
      <h1 className="title">
        Calculator <span className="arrow">→</span> Calculator
      </h1>
      <p className="subtitle">
        Every instance of the word{' '}
        <code className="from">“Calculator”</code> on a page is rewritten to{' '}
        <code className="to">“Calculator”</code>.
      </p>
      <p className="hint">It runs automatically on every site you visit.</p>
    </div>
  );
}

export default App;
