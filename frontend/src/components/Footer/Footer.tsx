import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__top">
          <div className="footer__column">
            <h3 className="footer__heading">Browse</h3>
            <ul className="footer__links">
              <li><Link to="/popular">Popular</Link></li>
              <li><Link to="/new">New</Link></li>
              <li><Link to="/guide">Guide</Link></li>
              <li><Link to="/subcri"></Link></li>
            </ul>
          </div>
          
          <div className="footer__column">
            <h3 className="footer__heading">Genres</h3>
            <ul className="footer__links">
              <li><Link to="/genre/action">Action</Link></li>
              <li><Link to="/genre/comedy">Comedy</Link></li>
              <li><Link to="/genre/drama">Drama</Link></li>
              <li><Link to="/genre/anime">Anime</Link></li>
              <li><Link to="/genre/horror">Horror</Link></li>
            </ul>
          </div>
          
          <div className="footer__column">
            <h3 className="footer__heading">Company</h3>
            <ul className="footer__links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className="footer__column">
            <h3 className="footer__heading">Support</h3>
            <ul className="footer__links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/terms">Terms of Use</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer__bottom">
          <div className="footer__logo">
            <Link to="/">WatchParty</Link>
          </div>
          
          <div className="footer__social">
            <a href="#" className="social-icon">FB</a>
            <a href="#" className="social-icon">TW</a>
            <a href="#" className="social-icon">IG</a>
          </div>
          
          <div className="footer__copyright">
            © {currentYear} WatchParty - You are not lonely anymore. 
          </div>
          
          <div className="footer__info">
            <p>We checked for updates on 75 streaming services on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
