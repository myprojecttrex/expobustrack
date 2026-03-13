// import { useEffect, useState } from "react";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Circle,
//   useMap,
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// import { ref, onValue } from "firebase/database";
// import { db } from "./firebase";

// // 🚌 Bus icon
// const busIcon = new L.Icon({
//   iconUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7y3VTFJ8cH7cAVdMC3QxSC9_2R7ZbxHvfuXRSCMpxsA&s",
//   iconSize: [40, 40],
// });

// // 👤 User icon
// const userIcon = new L.Icon({
//   iconUrl:
//     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp3RcyaqntiEDt5G5mm93sbAafWhzWci2qtxXwLWe_nQ&s",
//   iconSize: [32, 32],
//   iconAnchor: [16, 32],
// });

// // 📏 Distance calculation
// function getDistanceKm(lat1, lon1, lat2, lon2) {
//   const R = 6371;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;

//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) ** 2;

//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }

// // 🔄 Recenter helper
// function Recenter({ lat, lng }) {
//   const map = useMap();

//   useEffect(() => {
//     map.setView([lat, lng], 13);
//   }, [lat, lng, map]);

//   return null;
// }

// export default function MapView() {
//   const [userLoc, setUserLoc] = useState(null);
//   const [busLoc, setBusLoc] = useState(null);

//   const RADIUS_KM = 5;

//   // 👤 USER LOCATION
//   useEffect(() => {
//     const watchId = navigator.geolocation.watchPosition(
//       (pos) => {
//         setUserLoc({
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         });
//       },
//       (err) => alert("Location error: " + err.message),
//       {
//         enableHighAccuracy: true,
//         timeout: 20000,
//         maximumAge: 0,
//       }
//     );

//     return () => navigator.geolocation.clearWatch(watchId);
//   }, []);

//   // 🚌 BUS LOCATION from Firebase "drivers" node
//   useEffect(() => {
//     const driversRef = ref(db, "drivers");

//     const unsubscribe = onValue(driversRef, (snap) => {
//       const data = snap.val();
//       if (!data) return;

//       // take first driver in list
//       const driverId = Object.keys(data)[0];
//       const driver = data[driverId];

//       if (!driver.latitude || !driver.longitude) return;

//       setBusLoc({
//         lat: driver.latitude,
//         lng: driver.longitude,
//       });

//       console.log("🚌 Bus from DB:", driver.latitude, driver.longitude);
//     });

//     return () => unsubscribe();
//   }, []);

//   if (!userLoc) {
//     return <p style={{ textAlign: "center" }}>Getting your location…</p>;
//   }

//   let showBus = false;
//   let distanceKm = null;

//   if (busLoc) {
//     distanceKm = getDistanceKm(
//       userLoc.lat,
//       userLoc.lng,
//       busLoc.lat,
//       busLoc.lng
//     );
//     showBus = distanceKm <= RADIUS_KM;
//   }

//   return (
//     <MapContainer
//       center={[userLoc.lat, userLoc.lng]}
//       zoom={13}
//       style={{ height: "80vh", width: "100%" }}
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//       <Recenter lat={userLoc.lat} lng={userLoc.lng} />

//       {/* 👤 USER */}
//       <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon} />

//       {/* 🟢 USER RADIUS */}
//       <Circle
//         center={[userLoc.lat, userLoc.lng]}
//         radius={RADIUS_KM * 1000}
//         pathOptions={{ color: "green" }}
//       />

//       {/* 🚌 BUS (only if within 5 km) */}
//       {showBus && busLoc && (
//         <Marker position={[busLoc.lat, busLoc.lng]} icon={busIcon} />
//       )}
//     </MapContainer>
//   );
// }
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";

// ── Icons ──────────────────────────────────────────────────
const busIcon = new L.Icon({
  iconUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7y3VTFJ8cH7cAVdMC3QxSC9_2R7ZbxHvfuXRSCMpxsA&s",
  iconSize: [42, 42],
});

const userIcon = new L.Icon({
  iconUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp3RcyaqntiEDt5G5mm93sbAafWhzWci2qtxXwLWe_nQ&s",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// ── Distance (Haversine) ───────────────────────────────────
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Auto-recenter ──────────────────────────────────────────
function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 13); }, [lat, lng, map]);
  return null;
}

// ── Main Component ─────────────────────────────────────────
export default function MapView({ from, to }) {
  const [userLoc, setUserLoc] = useState(null);
  const [buses, setBuses]     = useState([]); // ✅ array of buses from Firebase

  const RADIUS_KM = 80; // match areaUtils.js

  // 👤 Watch user GPS
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => alert("Location error: " + err.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ✅ FIX: Read from correct Firebase path — trips/{tripCode}/drivers/{driverId}
  useEffect(() => {
    const tripsRef = ref(db, "trips");

    const unsubscribe = onValue(tripsRef, (snap) => {
      const data = snap.val();
      if (!data) { setBuses([]); return; }

      const activeBuses = [];

      Object.entries(data).forEach(([tripCode, trip]) => {
        // ✅ Filter: only show buses on the same route (from → to)
        const routeMatch =
          (!from && !to) || // no filter = show all
          (trip.from === from && trip.to === to);

        // ✅ Only show active trips (not ended)
        if (!routeMatch || trip.status === "ended") return;

        // Each trip can have multiple drivers
        if (!trip.drivers) return;

        Object.entries(trip.drivers).forEach(([driverId, driver]) => {
          if (!driver.latitude || !driver.longitude) return;

          // ✅ Only show buses updated in last 5 minutes
          const lastUpdate = driver.updatedAt || 0;
          const ageMin     = (Date.now() - lastUpdate) / 60000;
          if (ageMin > 5) return;

          activeBuses.push({
            tripCode,
            driverId,
            lat:      driver.latitude,
            lng:      driver.longitude,
            speed:    driver.speed || 0,
            busNo:    trip.busNo   || "Unknown Bus",
            from:     trip.from    || "—",
            to:       trip.to      || "—",
            ageMin:   ageMin.toFixed(1),
          });
        });
      });

      console.log("🚌 Active buses found:", activeBuses.length);
      setBuses(activeBuses);
    });

    return () => unsubscribe();
  }, [from, to]);

  if (!userLoc) {
    return (
      <div style={{ textAlign: "center", padding: 40, fontSize: 16, color: "#555" }}>
        📍 Getting your location...
      </div>
    );
  }

  // ✅ Filter buses within RADIUS_KM of user
  const nearbyBuses = buses.filter((bus) => {
    const d = getDistanceKm(userLoc.lat, userLoc.lng, bus.lat, bus.lng);
    return d <= RADIUS_KM;
  });

  return (
    <div style={{ position: "relative" }}>
      {/* ── Info Banner ── */}
      <div style={styles.banner}>
        <span>📍 Route: <strong>{from || "Any"} → {to || "Any"}</strong></span>
        <span style={styles.busCount}>
          🚌 {nearbyBuses.length} bus{nearbyBuses.length !== 1 ? "es" : ""} nearby
        </span>
      </div>

      {nearbyBuses.length === 0 && buses.length > 0 && (
        <div style={styles.noBusAlert}>
          ⚠️ {buses.length} bus(es) active but not within {RADIUS_KM} km of your location.
        </div>
      )}

      {buses.length === 0 && (
        <div style={styles.noBusAlert}>
          🔍 No active buses found for this route right now.
        </div>
      )}

      <MapContainer
        center={[userLoc.lat, userLoc.lng]}
        zoom={13}
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter lat={userLoc.lat} lng={userLoc.lng} />

        {/* 👤 User marker */}
        <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
          <Popup>📍 Your Location</Popup>
        </Marker>

        {/* 🟢 User radius circle */}
        <Circle
          center={[userLoc.lat, userLoc.lng]}
          radius={RADIUS_KM * 1000}
          pathOptions={{ color: "#1e0570", fillColor: "#4f46e5", fillOpacity: 0.05 }}
        />

        {/* 🚌 Bus markers */}
        {nearbyBuses.map((bus) => (
          <Marker key={`${bus.tripCode}-${bus.driverId}`} position={[bus.lat, bus.lng]} icon={busIcon}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>🚌 {bus.busNo}</strong><br />
                📍 {bus.from} → {bus.to}<br />
                🚀 Speed: {bus.speed > 0 ? `${(bus.speed * 3.6).toFixed(1)} km/h` : "Stopped"}<br />
                🕐 Updated: {bus.ageMin} min ago<br />
                🎫 Trip: #{bus.tripCode}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

const styles = {
  banner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#1e0570",
    color: "#fff",
    padding: "12px 20px",
    fontSize: 14,
  },
  busCount: {
    background: "rgba(255,255,255,0.2)",
    padding: "4px 12px",
    borderRadius: 20,
    fontWeight: 700,
  },
  noBusAlert: {
    background: "#fff3cd",
    color: "#856404",
    padding: "10px 20px",
    fontSize: 14,
    textAlign: "center",
    borderBottom: "1px solid #ffd966",
  },
};