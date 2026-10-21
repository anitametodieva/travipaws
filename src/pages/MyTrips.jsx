import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import "./Explore.css";

function getCoverImage(trip) {
  if (trip.image_url) {
    return trip.image_url;
  }

  if (Array.isArray(trip.images) && trip.images.length > 0) {
    const firstImage = trip.images[0];

    const { data } = supabase.storage
      .from("trip-images")
      .getPublicUrl(firstImage);

    return data.publicUrl;
  }

  return null;
}

function MyTrips() {
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;

    async function fetchMyTrips() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("trips")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTrips(data ?? []);
      }

      setLoading(false);
    }

    fetchMyTrips();

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <section className="explore-page">
        <p>Loading your trips...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="explore-page">
        <p role="alert">Error: {error}</p>
      </section>
    );
  }

  return (
    <section className="explore-page">
      <h1>My Trips</h1>

      {trips.length === 0 ? (
        <div>
          <p>You haven't shared any adventures yet.</p>
          <Link to="/trips/create">Create Your First Trip →</Link>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map((trip) => {
            const coverImage = getCoverImage(trip);

            return (
              <article key={trip.id} className="trip-card">
                {coverImage && (
                  <img
                    src={coverImage}
                    alt={trip.title}
                    className="trip-card-image"
                  />
                )}

                <h2>{trip.title}</h2>

                <p>
                  📍 {trip.location}, {trip.country}
                </p>

                <p>{trip.description}</p>

                <Link to={`/trips/${trip.id}`}>View Details</Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyTrips;
