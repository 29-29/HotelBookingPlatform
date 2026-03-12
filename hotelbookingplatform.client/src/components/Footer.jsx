import { Link } from 'react-router-dom';
import { Home, Facebook, Twitter, Instagram } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer bg-dark text-white">
            <div className="container footer-content">

                <div className="footer-brand glass-card">
                    <Link to="/" className="nav-brand">
                        <Home className="brand-icon text-primary" size={28} />
                        <span className="brand-text text-white">Haven<span className="text-secondary">Book</span></span>
                    </Link>
                    <p className="footer-tagline mt-4">
                        Your journey begins here. Find the perfect stay, anywhere in the world.
                    </p>
                    <div className="social-links mt-4">
                        <a href="#" className="social-link"><Facebook size={20} /></a>
                        <a href="#" className="social-link"><Twitter size={20} /></a>
                        <a href="#" className="social-link"><Instagram size={20} /></a>
                    </div>
                </div>

                <div className="footer-links">
                    <h4 className="footer-title">Explore</h4>
                    <Link to="/hotels">All Hotels</Link>
                    <Link to="/destinations">Destinations</Link>
                    <Link to="/offers">Special Offers</Link>
                </div>

                <div className="footer-links">
                    <h4 className="footer-title">Support</h4>
                    <Link to="/contact">Contact Us</Link>
                    <Link to="/faq">FAQ</Link>
                    <Link to="/terms">Terms of Service</Link>
                </div>

            </div>

            <div className="footer-bottom">
                <div className="container text-center">
                    <p>&copy; {new Date().getFullYear()} HavenBook. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
