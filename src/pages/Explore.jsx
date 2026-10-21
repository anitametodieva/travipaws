import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
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

function Explore() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrips() {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching trips:", error);
        setError(error.message);
      } else {
        setTrips(data);
      }

      setLoading(false);
    }

    fetchTrips();
  }, []);

  if (loading) {
    return <p>Loading trips...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <section className="explore-page">
      <h1>Explore Pet-Friendly Trips</h1>

      {trips.length === 0 ? (
        <p>No trips available yet.</p>
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

export default Explore;
