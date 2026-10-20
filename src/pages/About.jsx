import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <span className="about-label">🐾 ABOUT TRAVIPAWS</span>

        <h1>Every Adventure Is Better Together</h1>

        <p>
          Travipaws is a place for people who believe that the best travel
          memories are made with their four-legged companions.
        </p>

        <Link to="/trips" className="about-primary-btn">
          Explore Adventures →
        </Link>
      </section>

      <section className="about-story">
        <div className="about-section-heading">
          <span>OUR STORY</span>
          <h2>Travel More. Worry Less. Wag More.</h2>
        </div>

        <p>
          Planning a trip with a pet can be challenging. Finding welcoming
          destinations, discovering beautiful places and learning from other pet
          owners takes time.
        </p>

        <p>
          Travipaws brings travel lovers and pet owners together to share their
          experiences, discover inspiring destinations and make traveling with
          pets easier.
        </p>
      </section>

      <section className="about-mission">
        <span>OUR MISSION</span>

        <h2>Making Pet-Friendly Travel Easier</h2>

        <p>
          We believe pets are family, and adventures should include them
          whenever possible. Our mission is to inspire more journeys, encourage
          sharing and help travelers discover new places to explore together.
        </p>
      </section>

      <section className="about-features">
        <div className="about-section-heading">
          <span>DISCOVER TRAVIPAWS</span>
          <h2>What Can You Do Here?</h2>
        </div>

        <div className="about-features-grid">
          <article className="about-feature-card">
            <div className="about-feature-icon">🌍</div>
            <h3>Explore Destinations</h3>
            <p>
              Discover adventures shared by other travelers and find inspiration
              for your next journey.
            </p>
          </article>

          <article className="about-feature-card">
            <div className="about-feature-icon">📸</div>
            <h3>Share Your Adventures</h3>
            <p>
              Create travel posts, upload photos and share your favorite
              pet-friendly experiences.
            </p>
          </article>

          <article className="about-feature-card">
            <div className="about-feature-icon">❤️</div>
            <h3>Support the Community</h3>
            <p>
              Like your favorite adventures and discover places that inspire
              other pet lovers.
            </p>
          </article>
        </div>
      </section>

      <section className="about-cta">
        <h2>Your Next Adventure Starts Here</h2>

        <p>
          Discover new destinations and share unforgettable moments with your
          four-legged travel companion.
        </p>

        <Link to="/register" className="about-primary-btn">
          Join Travipaws →
        </Link>
      </section>
    </main>
  );
}

export default About;
