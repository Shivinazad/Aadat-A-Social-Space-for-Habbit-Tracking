import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Selection() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [selectedCommunities, setSelectedCommunities] = useState([]);

  // -------------------------
  // AUTH GUARD
  // -------------------------
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Dummy list — replace with database list if needed
  const communityList = [
    { name: "Fitness", id: "fitness" },
    { name: "Productivity", id: "productivity" },
    { name: "Mindfulness", id: "mindfulness" },
    { name: "Learning", id: "learning" },
  ];

  // -------------------------
  // TOGGLE SELECTION
  // -------------------------
  const toggleCommunity = (communityId) => {
    setSelectedCommunities((prev) =>
      prev.includes(communityId)
        ? prev.filter((c) => c !== communityId)
        : [...prev, communityId]
    );
  };

  // -------------------------
  // SUBMIT SELECTION
  // -------------------------
  const saveSelection = async () => {
    if (!token) {
      alert("You are not logged in.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          communities: selectedCommunities,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Failed to save selection");

      navigate("/home");
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  // -------------------------
  // JSX
  // -------------------------
  return (
    <div className="selection-page">
      <h2>Select Your Communities</h2>

      <div className="community-grid">
        {communityList.map((community) => (
          <div
            key={community.id}
            className={`community-card ${
              selectedCommunities.includes(community.id) ? "selected" : ""
            }`}
            onClick={() => toggleCommunity(community.id)}
          >
            <h3>{community.name}</h3>
          </div>
        ))}
      </div>

      <button
        id="continue-btn"
        disabled={selectedCommunities.length === 0}
        onClick={saveSelection}
        className="continue-button"
      >
        Continue
      </button>
    </div>
  );
}
