import { Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

import Home from './pages/Home';
import Explore from './pages/Explore';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateTrip from './pages/CreateTrip';
import TripDetails from './pages/TripDetails';
import EditTrip from './pages/EditTrip';
import NotFound from './pages/NotFound';

function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/trips" element={<Explore />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/trips/create" element={<CreateTrip />} />
                <Route path="/trips/:id" element={<TripDetails />} />
                <Route path="/trips/:id/edit" element={<EditTrip />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;