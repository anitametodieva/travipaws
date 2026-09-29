import './Hero.css';
import heroImage from '../../assets/images/hero-kiko-suny.png';

export default function Hero() {
    return (
        <section
            className="hero"
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            <div className="hero-overlay"></div>

            <div className="hero-content">
                <h1>
                    Explore the world
                    <br />
                    with your best friend.
                </h1>

                <p>
                    Discover pet-friendly destinations, get inspired by real
                    trips and share your own adventures with the community.
                </p>

                <a href="/trips" className="hero-button">
                    Explore Trips →
                </a>
            </div>
        </section>
    );
}