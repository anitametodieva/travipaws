import Hero from '../components/Hero/Hero';
import Features from '../components/Features/Features';
import LatestAdventures from '../components/LatestAdventures/LatestAdventures';
import WhyTravipaws from '../components/WhyTravipaws/WhyTravipaws';

function Home() {
    return (
        <>
            <Hero />
            <Features />
            <LatestAdventures />
            <WhyTravipaws />
        </>
    );
}

export default Home;