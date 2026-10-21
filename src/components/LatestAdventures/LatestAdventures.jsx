import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import "./LatestAdventures.css";

function getCoverImage(trip) {
  if (trip.image_url) {
    return trip.image_url;
  }

  if (Array.isArray(trip.images) && trip.images.length > 0) {
    const { data } = supabase.storage
      .from("trip-images")
      .getPublicUrl(trip.images[0]);

    return data.publicUrl;
  }

  return null;
}

export default function LatestAdventures() {
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchLatestAdventures() {
      try {
        const { data, error: fetchError } = await supabase
          .from("trips")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (!active) return;

        if (fetchError) {
          setError("Could not load the latest adventures.");
          console.error("Error loading adventures:", fetchError);
        } else {
          setAdventures(data ?? []);
        }
      } catch (err) {
        if (active) {
          setError("Could not load the latest adventures.");
          console.error(err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchLatestAdventures();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="latest-adventures">
      <div className="latest-container">
        <div className="latest-heading">
          <div>
            <span className="section-label">Community stories</span>
            <h2>Latest Adventures</h2>
          </div>

          <Link to="/trips" className="view-all-link">
            View all trips →
          </Link>
        </div>

        {loading ? (
          <p className="latest-message">Loading latest adventures...</p>
        ) : error ? (
          <p className="latest-message" role="alert">
            {error}
          </p>
        ) : adventures.length === 0 ? (
          <p className="latest-message">
            No adventures yet. Be the first to share your trip!
          </p>
        ) : (
          <div className="adventures-grid">
            {adventures.map((adventure) => {
              const coverImage = getCoverImage(adventure);

              return (
                <article className="adventure-card" key={adventure.id}>
                  <div className="adventure-image-wrapper">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={adventure.title}
                        className="adventure-image"
                      />
                    ) : (
                      <div className="adventure-image-placeholder">🐾</div>
                    )}
                  </div>

                  <div className="adventure-content">
                    <span className="country-badge">{adventure.country}</span>

                    <h3>{adventure.title}</h3>

                    <p>{adventure.description}</p>

                    <div className="adventure-footer">
                      <Link to={`/trips/${adventure.id}`}>View trip →</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
