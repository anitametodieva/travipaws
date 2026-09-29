import './LatestAdventures.css';

import switzerlandImage from '../../assets/images/trip-switzerland.jpg';
import italyImage from '../../assets/images/trip-italy.jpg';
import franceImage from '../../assets/images/trip-france.jpg';

const adventures = [
    {
        id: 1,
        country: 'Switzerland',
        title: 'Adventure at Blausee',
        description: 'Crystal-clear water, peaceful forest paths and a perfect day with Kiko and Suny.',
        image: switzerlandImage,
        rating: 5,
    },
    {
        id: 2,
        country: 'Italy',
        title: 'Hidden Beach Adventure',
        description: 'A beautiful pet-friendly escape surrounded by cliffs and turquoise water.',
        image: italyImage,
        rating: 5,
    },
    {
        id: 3,
        country: 'France',
        title: 'Weekend in the French Alps',
        description: 'Nature, peaceful walks and unforgettable moments with your pet.',
        image: franceImage,
        rating: 5,
    },
];

export default function LatestAdventures() {
    return (
        <section className="latest-adventures">
            <div className="latest-container">
                <div className="latest-heading">
                    <div>
                        <span className="section-label">Community stories</span>
                        <h2>Latest Adventures</h2>
                    </div>

                    <a href="/trips" className="view-all-link">
                        View all trips →
                    </a>
                </div>

                <div className="adventures-grid">
                    {adventures.map((adventure) => (
                        <article className="adventure-card" key={adventure.id}>
                            <div className="adventure-image-wrapper">
                                <img
                                    src={adventure.image}
                                    alt={adventure.title}
                                    className="adventure-image"
                                />

                                <span className="country-badge">
                                    {adventure.country}
                                </span>
                            </div>

                            <div className="adventure-content">
                                <h3>{adventure.title}</h3>

                                <p>{adventure.description}</p>

                                <div className="adventure-footer">
                                    <span className="rating">
                                        {'★'.repeat(adventure.rating)}
                                    </span>

                                    <a href={`/trips/${adventure.id}`}>
                                        View trip →
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}