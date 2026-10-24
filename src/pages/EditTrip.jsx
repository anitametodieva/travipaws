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
  const [originalImages, setOriginalImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [newCoverIndex, setNewCoverIndex] = useState(null);

  useEffect(() => {
    const urls = newImages.map((file) => URL.createObjectURL(file));

    setNewImagePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

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
          setOriginalImages([...tripImages]);

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

  const handleRemoveNewImage = (indexToRemove) => {
    setNewImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove),
    );

    setNewCoverIndex((prevIndex) => {
      if (prevIndex === null) {
        return null;
      }

      if (prevIndex === indexToRemove) {
        return null;
      }

      if (indexToRemove < prevIndex) {
        return prevIndex - 1;
      }

      return prevIndex;
    });
  };

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    e.target.value = "";

    if (files.length === 0) return;

    setError("");

    const totalImages = existingImages.length + newImages.length + files.length;

    if (totalImages > 10) {
      setError("You can have a maximum of 10 photos per trip.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const invalidFile = files.find((file) => !allowedTypes.includes(file.type));

    if (invalidFile) {
      setError("Only JPG, PNG and WebP images are allowed.");
      return;
    }

    const tooLarge = files.find((file) => file.size > 15 * 1024 * 1024);

    if (tooLarge) {
      setError("Each image must be smaller than 15 MB.");
      return;
    }

    setNewImages((prevImages) => [...prevImages, ...files]);
  };

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

    if (
      !title.trim() ||
      !country.trim() ||
      !location.trim() ||
      !description.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (existingImages.length + newImages.length > 10) {
      setError("You can have a maximum of 10 photos per trip.");
      return;
    }

    setSaving(true);

    const uploadedPaths = [];
    let tripUpdated = false;

    try {
      for (const image of newImages) {
        const fileExtension = image.name.split(".").pop().toLowerCase();
        const fileName = `${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `${user.id}/${fileName}`;

        const fileData = await image.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from("trip-images")
          .upload(filePath, fileData, {
            contentType: image.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(filePath);
      }

      const updatedImages = [...existingImages, ...uploadedPaths];

      const selectedNewCover =
        newCoverIndex !== null ? uploadedPaths[newCoverIndex] : null;

      const updatedCover =
        selectedNewCover ||
        (coverImage && updatedImages.includes(coverImage)
          ? coverImage
          : null) ||
        updatedImages[0] ||
        null;

      const coverUrl = updatedCover
        ? supabase.storage.from("trip-images").getPublicUrl(updatedCover).data
            .publicUrl
        : null;

      const { data, error: updateError } = await supabase
        .from("trips")
        .update({
          title: title.trim(),
          country: country.trim(),
          location: location.trim(),
          description: description.trim(),
          images: updatedImages,
          image_url: coverUrl,
        })
        .eq("id", id)
        .eq("owner_id", user.id)
        .select("id");

      if (updateError) {
        throw updateError;
      }

      if (!data || data.length === 0) {
        throw new Error("Trip could not be updated.");
      }

      tripUpdated = true;

      const removedPaths = originalImages.filter(
        (path) =>
          !updatedImages.includes(path) && path.startsWith(`${user.id}/`),
      );

      if (removedPaths.length > 0) {
        const { data: otherTrips, error: checkError } = await supabase
          .from("trips")
          .select("images")
          .neq("id", id);

        if (checkError) {
          console.error("Could not check image references:", checkError);
        } else {
          const usedElsewhere = new Set(
            (otherTrips || []).flatMap((trip) =>
              Array.isArray(trip.images) ? trip.images : [],
            ),
          );

          const pathsToDelete = removedPaths.filter(
            (path) => !usedElsewhere.has(path),
          );

          if (pathsToDelete.length > 0) {
            const { error: deleteError } = await supabase.storage
              .from("trip-images")
              .remove(pathsToDelete);

            if (deleteError) {
              console.error("Could not delete unused photos:", deleteError);
            }
          }
        }
      }

      navigate(`/trips/${id}`);
    } catch (err) {
      if (!tripUpdated && uploadedPaths.length > 0) {
        const { error: cleanupError } = await supabase.storage
          .from("trip-images")
          .remove(uploadedPaths);

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError);
        }
      }

      setError(err.message || "Something went wrong. Please try again.");
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
                          onClick={() => {
                            setCoverImage(path);
                            setNewCoverIndex(null);
                          }}
                          disabled={
                            saving ||
                            (coverImage === path && newCoverIndex === null)
                          }
                        >
                          {coverImage === path && newCoverIndex === null
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
            <div className="edit-trip-add-photos">
              <label
                htmlFor="edit-new-images"
                className="edit-trip-upload-label"
              >
                📷 Choose Photos
              </label>

              <input
                id="edit-new-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleNewImagesChange}
                disabled={
                  saving || existingImages.length + newImages.length >= 10
                }
              />

              <p className="edit-trip-photo-count">
                {existingImages.length + newImages.length} / 10 photos (
                {existingImages.length} saved, {newImages.length} new)
              </p>

              {newImagePreviews.length > 0 && (
                <>
                  <h3>New Photos</h3>

                  <div className="edit-trip-photo-grid">
                    {newImagePreviews.map((preview, index) => (
                      <div className="edit-trip-photo" key={preview}>
                        <img
                          src={preview}
                          alt={`New trip photo ${index + 1}`}
                        />
                        <span className="edit-trip-new-photo-label">
                          New photo
                        </span>

                        <button
                          type="button"
                          className="edit-trip-cover-button"
                          onClick={() => {
                            setNewCoverIndex(index);
                            setCoverImage(null);
                          }}
                          disabled={saving || newCoverIndex === index}
                        >
                          {newCoverIndex === index
                            ? "⭐ Cover Photo"
                            : "Set as Cover"}
                        </button>

                        <button
                          type="button"
                          className="edit-trip-remove-button"
                          onClick={() => handleRemoveNewImage(index)}
                          disabled={saving}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
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
