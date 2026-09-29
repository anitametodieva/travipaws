import './Features.css';
import { FaPaw, FaMap, FaUsers, FaHeart } from 'react-icons/fa';

export default function Features() {
    const features = [
        {
            icon: <FaPaw />,
            title: 'Pet-Friendly Places',
            text: 'Find destinations that welcome pets.',
        },
        {
            icon: <FaMap />,
            title: 'Real Travel Experiences',
            text: 'Get inspired by our community.',
        },
        {
            icon: <FaUsers />,
            title: 'Like-Minded Community',
            text: 'Share trips, photos and stories.',
        },
        {
            icon: <FaHeart />,
            title: 'Travel with Confidence',
            text: 'Helpful information for stress-free trips.',
        },
    ];

    return (
        <section className="features">
            <div className="features-container">
                {features.map((feature) => (
                    <div className="feature-item" key={feature.title}>
                        <div className="feature-icon">
                            {feature.icon}
                        </div>

                        <div>
                            <h3>{feature.title}</h3>
                            <p>{feature.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}