import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import "./EditTrip.css";

function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchTrip() {
      setLoading(true);
      setError("");
      setCanEdit(false);

      try {
        const { data, error: fetchError } = await supabase
          .from("trips")
          .select("*")
          .eq("id", id)
          .single();

        if (!active) return;

        if (fetchError) {
          setError(fetchError.message);
        } else if (!user || data.owner_id !== user.id) {
          setError("You are not allowed to edit this trip.");
        } else {
          setTitle(data.title || "");
          setCountry(data.country || "");
          setLocation(data.location || "");
          setDescription(data.description || "");

          const tripImages = Array.isArray(data.images) ? data.images : [];

          setExistingImages(tripImages);

          const currentCover = tripImages.find((path) => {
            const { data: imageData } = supabase.storage
              .from("trip-images")
              .getPublicUrl(path);

            return imageData.publicUrl === data.image_url;
          });

          setCoverImage(currentCover || tripImages[0] || null);

          setCanEdit(true);
        }
      } catch {
        if (active) {
          setError("Could not load this trip.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (user) {
      fetchTrip();
    } else {
      setLoading(false);
      setCanEdit(false);
      setError("You must be logged in to edit a trip.");
    }

    return () => {
      active = false;
    };
  }, [id, user]);

  function handleRemoveExistingImage(pathToRemove) {
    const updatedImages = existingImages.filter(
      (path) => path !== pathToRemove,
    );

    setExistingImages(updatedImages);

    if (coverImage === pathToRemove) {
      setCoverImage(updatedImages[0] || null);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setError("");

    if (!user || !canEdit) {
      setError("You are not allowed to edit this trip.");
      return;
    }

    setSaving(true);

    try {
      const { data, error: updateError } = await supabase
        .from("trips")
        .update({
          title: title.trim(),
          country: country.trim(),
          location: location.trim(),
          description: description.trim(),
          images: existingImages,
          image_url: coverImage
            ? supabase.storage.from("trip-images").getPublicUrl(coverImage).data
                .publicUrl
            : null,
        })
        .eq("id", id)
        .eq("owner_id", user.id)
        .select("id");

      if (updateError) {
        setError(updateError.message);
        return;
      }

      if (!data || data.length === 0) {
        setError("Trip could not be updated.");
        return;
      }

      navigate(`/trips/${id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="edit-trip-page">
        <p>Loading trip...</p>
      </main>
    );
  }

  if (!canEdit) {
    return (
      <main className="edit-trip-page">
        <div className="edit-trip-card">
          <p className="edit-trip-error" role="alert">
            {error || "You cannot edit this trip."}
          </p>

          <Link to="/trips" className="edit-trip-cancel">
            Back to Explore
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="edit-trip-page">
      <section className="edit-trip-card">
        <div className="edit-trip-header">
          <span className="edit-trip-label">UPDATE YOUR ADVENTURE</span>

          <h1>Edit Trip</h1>

          <p>
            Update your pet-friendly adventure and keep your travel story up to
            date.
          </p>
        </div>

        <form className="edit-trip-form" onSubmit={handleSubmit}>
          <div className="edit-trip-field">
            <label htmlFor="edit-title">
              Trip Title <span>*</span>
            </label>

            <input
              id="edit-title"
              type="text"
              placeholder="e.g. Weekend in the Dolomites"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="edit-trip-field">
            <label htmlFor="edit-country">
              Country <span>*</span>
            </label>

            <input
              id="edit-country"
              type="text"
              placeholder="e.g. Italy"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>

          <div className="edit-trip-field">
            <label htmlFor="edit-location">
              Location <span>*</span>
            </label>

            <input
              id="edit-location"
              type="text"
              placeholder="e.g. Ortisei"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="edit-trip-field">
            <label htmlFor="edit-description">
              Description <span>*</span>
            </label>

            <textarea
              id="edit-description"
              placeholder="Tell the community about your trip..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="6"
            />
          </div>

          <div className="edit-trip-photos">
            <h2>Trip Photos</h2>
            <p>Manage the photos of your adventure.</p>

            {existingImages.length === 0 ? (
              <p>No photos uploaded yet.</p>
            ) : (
              <div className="edit-trip-photo-grid">
                {existingImages.map((path) => {
                  const { data } = supabase.storage
                    .from("trip-images")
                    .getPublicUrl(path);

                  return (
                    <div
                      key={path}
                      className={`edit-trip-photo ${
                        coverImage === path ? "selected-cover" : ""
                      }`}
                    >
                      <img src={data.publicUrl} alt="Trip" />

                      <div className="edit-trip-photo-actions">
                        <button
                          type="button"
                          className="edit-trip-cover-button"
                          onClick={() => setCoverImage(path)}
                          disabled={saving || coverImage === path}
                        >
                          {coverImage === path
                            ? "⭐ Cover Photo"
                            : "Set as Cover"}
                        </button>

                        <button
                          type="button"
                          className="edit-trip-remove-button"
                          onClick={() => handleRemoveExistingImage(path)}
                          disabled={saving}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <p className="edit-trip-error" role="alert">
              {error}
            </p>
          )}

          <div className="edit-trip-actions">
            <button
              type="submit"
              className="edit-trip-submit"
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "💾 Save Changes"}
            </button>

            <Link to={`/trips/${id}`} className="edit-trip-cancel">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default EditTrip;
