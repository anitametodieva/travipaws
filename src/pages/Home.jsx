import { useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import Hero from '../components/Hero/Hero';
import Features from '../components/Features/Features';
import LatestAdventures from '../components/LatestAdventures/LatestAdventures';
import WhyTravipaws from '../components/WhyTravipaws/WhyTravipaws';

function Home() {
    useEffect(() => {
    async function testConnection() {
        const { data, error } = await supabase
            .from('trips')
            .select('*');

        console.log('Supabase data:', data);
        console.log('Supabase error:', error);
    }

    testConnection();
}, []);
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