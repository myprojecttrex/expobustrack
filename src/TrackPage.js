import { useState } from "react";
import MapView from "./MapView";
import { TAMIL_NADU_DISTRICTS } from "./constants/districts";
import "./TrackPage.css";

export default function TrackPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState(false);

  return (
    <div className="track-container">
      {!search ? (
        <div className="route-card">
          <h2 className="route-title">Select Route</h2>

          {/* FROM */}
          <div className="field">
            <label>From</label>
            <select
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                if (e.target.value === to) {
                  setTo("");
                }
              }}
            >
              <option value="">Select From</option>
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* TO */}
          <div className="field">
            <label>To</label>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="">Select To</option>
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option
                  key={d}
                  value={d}
                  disabled={d === from}
                >
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button
            className="search-btn"
            disabled={!from || !to}
            onClick={() => setSearch(true)}
          >
            🔍 Search Buses
          </button>
        </div>
      ) : (
        <div className="map-wrapper">
          <MapView from={from} to={to} />
        </div>
      )}
    </div>
  );
}
