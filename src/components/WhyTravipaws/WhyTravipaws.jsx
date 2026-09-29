import './WhyTravipaws.css';
import { FaCompass, FaHeart, FaUsers, FaStar } from 'react-icons/fa';

const reasons = [
    {
        icon: <FaCompass />,
        title: 'Discover',
        text: 'Find pet-friendly destinations around the world.',
    },
    {
        icon: <FaHeart />,
        title: 'Share',
        text: 'Post your own experiences and help other pet lovers.',
    },
    {
        icon: <FaUsers />,
        title: 'Connect',
        text: 'Be part of a community that loves to travel with pets.',
    },
    {
        icon: <FaStar />,
        title: 'Plan Better',
        text: 'Get useful tips and real recommendations from other travelers.',
    },
];

export default function WhyTravipaws() {
    return (
        <section className="why-travipaws">
            <div className="why-container">
                <div className="why-intro">
                    <span className="why-label">Travel better together</span>
                    <h2>Why Travipaws?</h2>

                    <p>
                        Travipaws helps pet owners discover inspiring places,
                        share real travel experiences and plan better trips
                        with their best friends.
                    </p>
                </div>

                <div className="why-grid">
                    {reasons.map((reason) => (
                        <div className="why-item" key={reason.title}>
                            <div className="why-icon">
                                {reason.icon}
                            </div>

                            <h3>{reason.title}</h3>
                            <p>{reason.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}