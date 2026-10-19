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
    setError("");

    if (!user) {
      setError("You must be logged in to create a trip.");
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

      const { error: insertError } = await supabase.from("trips").insert({
        title,
        country,
        location,
        description,
        images: uploadedPaths,
        image_url: uploadedPaths[coverIndex]
          ? supabase.storage
              .from("trip-images")
              .getPublicUrl(uploadedPaths[coverIndex]).data.publicUrl
          : null,
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
    <section className="create-trip">
      <h1>Create a Trip</h1>

      <p>Share your pet-friendly adventure with the community!</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Trip Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="country">Country</label>
          <input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="images">Upload Images (Max 10)</label>

          <input
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImagesChange}
          />

          <p>{images.length} / 10 images selected</p>
          {previews.length > 0 && (
            <div className="image-preview-container">
              {previews.map((preview, index) => (
                <div className="image-preview" key={preview}>
                  <img
                    src={preview}
                    alt={`Trip preview ${index + 1}`}
                    width="150"
                    height="120"
                    style={{ objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={() => setCoverIndex(index)}
                    disabled={coverIndex === index}
                  >
                    {coverIndex === index ? "⭐ Cover Photo" : "Set as Cover"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Trip"}
        </button>
      </form>
    </section>
  );
}

export default CreateTrip;
