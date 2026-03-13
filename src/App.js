import { useState } from "react";
import TrackPage from "./TrackPage";
import "./App.css";

export default function App() {
  const [goTrack, setGoTrack] = useState(false);

  if (goTrack) {
    return <TrackPage />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">BusTrack</h1>
      </header>

      <main className="hero">
        <h2 className="hero-title">Live Bus Tracking System</h2>
        <p className="hero-subtitle">
          Track public buses in real time using GPS-based geo-fencing.
        </p>

        <button className="track-btn" onClick={() => setGoTrack(true)}>
          🚍 Track Buses
        </button>
      </main>

      <footer className="footer">
        <p>© 2026 BusTrack | College Prototype</p>
      </footer>
    </div>
  );
}
