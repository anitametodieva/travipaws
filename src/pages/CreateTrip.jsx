import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import "./CreateTrip.css";

function CreateTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const imagePreviews = images.map((image) => URL.createObjectURL(image));

    setPreviews(imagePreviews);

    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const updatedImages = [...images, ...files];

    if (updatedImages.length > 10) {
      setError("You can upload a maximum of 10 images.");
      e.target.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const invalidFile = files.find((file) => !allowedTypes.includes(file.type));

    if (invalidFile) {
      setError("Only JPG, PNG and WebP images are allowed.");
      e.target.value = "";
      return;
    }

    const tooLarge = files.find((file) => file.size > 5 * 1024 * 1024);

    if (tooLarge) {
      setError("Each image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setImages(updatedImages);
    setError("");
    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove),
    );

    setCoverIndex((prevIndex) => {
      if (indexToRemove === prevIndex) {
        return 0;
      }

      if (indexToRemove < prevIndex) {
        return prevIndex - 1;
      }

      return prevIndex;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!user) {
      setError("You must be logged in to create a trip.");
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

    setLoading(true);

    const uploadedPaths = [];

    try {
      for (const image of images) {
        const fileExtension = image.name.split(".").pop().toLowerCase();

        const fileName = `${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("trip-images")
          .upload(filePath, image);

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(filePath);
      }

      const coverPath = uploadedPaths[coverIndex];

      const coverUrl = coverPath
        ? supabase.storage.from("trip-images").getPublicUrl(coverPath).data
            .publicUrl
        : null;

      const { error: insertError } = await supabase.from("trips").insert({
        title: title.trim(),
        country: country.trim(),
        location: location.trim(),
        description: description.trim(),
        images: uploadedPaths,
        image_url: coverUrl,
        owner_id: user.id,
      });

      if (insertError) {
        throw insertError;
      }

      navigate("/trips");
    } catch (err) {
      if (uploadedPaths.length > 0) {
        const { error: cleanupError } = await supabase.storage
          .from("trip-images")
          .remove(uploadedPaths);

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError);
        }
      }

      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-trip-page">
      <section className="create-trip-card">
        <div className="create-trip-header">
          <span className="create-trip-label">SHARE YOUR ADVENTURE</span>

          <h1>Create a Trip</h1>

          <p>
            Share your favorite pet-friendly destination, upload your photos and
            inspire other travelers.
          </p>
        </div>

        <form className="create-trip-form" onSubmit={handleSubmit}>
          <div className="create-trip-field">
            <label htmlFor="title">
              Trip Title <span>*</span>
            </label>

            <input
              id="title"
              type="text"
              placeholder="e.g. Weekend in the Dolomites"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="create-trip-row">
            <div className="create-trip-field">
              <label htmlFor="country">
                Country <span>*</span>
              </label>

              <input
                id="country"
                type="text"
                placeholder="e.g. Italy"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="create-trip-field">
              <label htmlFor="location">
                Location <span>*</span>
              </label>

              <input
                id="location"
                type="text"
                placeholder="e.g. Ortisei"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={150}
                required
              />
            </div>
          </div>

          <div className="create-trip-field">
            <label htmlFor="description">
              Description <span>*</span>
            </label>

            <textarea
              id="description"
              placeholder="Tell the community about your trip. What made this place special? Was it pet-friendly?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="create-trip-upload">
            <div className="create-trip-upload-heading">
              <h2>Trip Photos</h2>

              <p>
                Add up to 10 photos of your adventure. JPG, PNG or WebP, maximum
                5 MB each.
              </p>
            </div>

            <label htmlFor="images" className="create-trip-upload-label">
              <span className="upload-icon">📷</span>
              <span className="upload-title">Choose Photos</span>
              <span className="upload-description">
                Click here to select images
              </span>
            </label>

            <input
              id="images"
              className="create-trip-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImagesChange}
              disabled={loading || images.length >= 10}
            />

            <p className="create-trip-image-count">
              {images.length} / 10 photos selected
            </p>

            {previews.length > 0 && (
              <>
                <p className="create-trip-cover-hint">
                  ⭐ Select the photo you want to use as the cover of your trip.
                </p>

                <div className="image-preview-container">
                  {previews.map((preview, index) => (
                    <div
                      className={`image-preview ${
                        coverIndex === index ? "selected-cover" : ""
                      }`}
                      key={preview}
                    >
                      <img src={preview} alt={`Trip preview ${index + 1}`} />

                      <div className="image-preview-actions">
                        <button
                          type="button"
                          className="cover-photo-button"
                          onClick={() => setCoverIndex(index)}
                          disabled={loading || coverIndex === index}
                        >
                          {coverIndex === index
                            ? "⭐ Cover Photo"
                            : "Set as Cover"}
                        </button>

                        <button
                          type="button"
                          className="remove-photo-button"
                          onClick={() => handleRemoveImage(index)}
                          disabled={loading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {error && (
            <p className="create-trip-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="create-trip-submit"
            disabled={loading}
          >
            {loading ? "Creating your trip..." : "🐾 Publish Trip"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default CreateTrip;
