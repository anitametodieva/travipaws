import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

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

  useEffect(() => {
    async function fetchTrip() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else if (!user || data.owner_id !== user.id) {
        setError("You are not allowed to edit this trip.");
      } else {
        setTitle(data.title || "");
        setCountry(data.country || "");
        setLocation(data.location || "");
        setDescription(data.description || "");
      }

      setLoading(false);
    }

    if (user) {
      fetchTrip();
    } else {
      setLoading(false);
      setError("You must be logged in to edit a trip.");
    }
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    setSaving(true);

    const { data, error: updateError } = await supabase
      .from("trips")
      .update({
        title,
        country,
        location,
        description,
      })
      .eq("id", id)
      .eq("owner_id", user.id)
      .select("id");

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (!data || data.length === 0) {
      setError("Trip could not be updated.");
      return;
    }

    navigate(`/trips/${id}`);
  };

  if (loading) {
    return <p>Loading trip...</p>;
  }

  if (error && !title) {
    return <p className="error">{error}</p>;
  }

  return (
    <section className="edit-trip">
      <h1>Edit Trip</h1>

      <p>Update your pet-friendly adventure.</p>

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

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <Link to={`/trips/${id}`}>Cancel</Link>
      </form>
    </section>
  );
}

export default EditTrip;
