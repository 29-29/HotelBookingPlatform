import { useState } from 'react';
import { Search, Calendar, MapPin, Users } from 'lucide-react';
import './Home.css';

const Home = () => {
    const [destination, setDestination] = useState('');

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background animate-fade-in">
                    {/* We'll use a CSS gradient/image mix for the premium look */}
                    <div className="hero-overlay"></div>
                </div>

                <div className="container hero-content">
                    <h1 className="hero-title animate-float">
                        Find Your Next <br />
                        <span className="text-gradient">Perfect Stay</span>
                    </h1>
                    <p className="hero-subtitle mb-8">
                        Discover extraordinary homes, hotels, and experiences around the world.
                    </p>

                    {/* Search Glass Card */}
                    <div className="search-bar glass-card">
                        <div className="search-inputs">

                            <div className="search-field">
                                <MapPin className="search-icon" size={20} />
                                <div className="field-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        placeholder="Where are you going?"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="search-divider"></div>

                            <div className="search-field">
                                <Calendar className="search-icon" size={20} />
                                <div className="field-group">
                                    <label>Check in - Check out</label>
                                    <input type="text" placeholder="Add dates" />
                                </div>
                            </div>

                            <div className="search-divider"></div>

                            <div className="search-field">
                                <Users className="search-icon" size={20} />
                                <div className="field-group">
                                    <label>Guests</label>
                                    <input type="text" placeholder="1 guest, 1 room" />
                                </div>
                            </div>

                            <button className="btn btn-primary search-btn">
                                <Search size={20} />
                                <span>Search</span>
                            </button>

                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Section placeholder */}
            <section className="featured-section container">
                <h2 className="section-title">Trending Destinations</h2>
                <p className="section-subtitle mb-8">Most popular choices for travelers from around the world</p>

                <div className="featured-grid">
                    {/* Placeholder cards to show the design */}
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="hotel-card glass-card">
                            <div className="card-image-placeholder"></div>
                            <div className="card-content">
                                <div className="card-header">
                                    <h3>Luxury Villa {item}</h3>
                                    <div className="rating">★ 4.9</div>
                                </div>
                                <p className="location">Bali, Indonesia</p>
                                <div className="price-tag mt-4">
                                    <span className="price">$250</span> / night
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
