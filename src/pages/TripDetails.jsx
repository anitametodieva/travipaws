import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import "./TripDetails.css";

function TripDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function fetchTrip() {
      setLoading(true);

      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setTrip(data);
      }

      setLoading(false);
    }

    fetchTrip();
  }, [id]);

  if (loading) {
    return <p>Loading trip...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!trip) {
    return <p>Trip not found.</p>;
  }

  const images = Array.isArray(trip.images)
    ? trip.images.map((path) => {
        const { data } = supabase.storage
          .from("trip-images")
          .getPublicUrl(path);

        return data.publicUrl;
      })
    : [];

  if (images.length === 0 && trip.image_url) {
    images.push(trip.image_url);
  }

  if (trip.image_url && images.includes(trip.image_url)) {
    const coverIndex = images.indexOf(trip.image_url);

    images.splice(coverIndex, 1);
    images.unshift(trip.image_url);
  }

  const showPreviousImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDelete = async () => {
    if (!user || user.id !== trip.owner_id || deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this trip? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setDeleteError("");

    const { data, error } = await supabase
      .from("trips")
      .delete()
      .eq("id", trip.id)
      .eq("owner_id", user.id)
      .select("id");

    if (error) {
      setDeleteError(error.message);
      setDeleting(false);
      return;
    }

    if (!data || data.length === 0) {
      setDeleteError("Trip could not be deleted.");
      setDeleting(false);
      return;
    }

    if (Array.isArray(trip.images) && trip.images.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("trip-images")
        .remove(trip.images);

      if (storageError) {
        console.error("Error deleting trip images:", storageError.message);
      }
    }

    navigate("/trips");
  };

  return (
    <section className="trip-details">
      <Link to="/trips">← Back to Explore</Link>

      <h1>{trip.title}</h1>
      {user?.id === trip.owner_id && (
        <div className="trip-actions">
          <Link to={`/trips/${trip.id}/edit`}>✏️ Edit Trip</Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="delete-trip-btn"
          >
            {deleting ? "Deleting..." : "🗑️ Delete Trip"}
          </button>
        </div>
      )}

      {deleteError && <p className="error">{deleteError}</p>}

      <p>
        📍 {trip.location}, {trip.country}
      </p>

      {images.length > 0 && (
        <div className="trip-gallery">
          <div className="trip-main-image">
            <img
              src={images[selectedImage]}
              alt={trip.title}
              onClick={() => setIsLightboxOpen(true)}
            />
          </div>

          <div className="trip-thumbnails">
            {images.map((image, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={selectedImage === index ? "active-thumbnail" : ""}
              >
                <img src={image} alt={`${trip.title} ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="trip-description">
        <h2>About This Trip</h2>
        <p>{trip.description}</p>
      </div>
      {isLightboxOpen && images.length > 0 && (
        <div
          className="lightbox"
          onClick={() => setIsLightboxOpen(false)}
          role="presentation"
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close image"
          >
            ✕
          </button>

          <button
            type="button"
            className="lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              showPreviousImage();
            }}
            aria-label="Previous image"
          >
            ❮
          </button>

          <img
            src={images[selectedImage]}
            alt={trip.title}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            className="lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              showNextImage();
            }}
            aria-label="Next image"
          >
            ❯
          </button>
        </div>
      )}
    </section>
  );
}

export default TripDetails;
