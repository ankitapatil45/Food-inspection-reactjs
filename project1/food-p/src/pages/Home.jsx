import { Link } from "react-router-dom";
import './Home.css'; // custom CSS import

export default function Home() {
  return (
    <div>
      
      {/* Header Section */}
    

      {/* Hero Section */}
      <section className="hero" aria-label="Welcome Section">
        <h2>Ensuring Food Safety, One Inspection at a Time</h2>
        <p>
          Monitor and manage food quality inspections with live tracking, video verification,
          and certificate management — all in one powerful portal.
        </p>
        <a href="#features" className="btn-primary" aria-label="Learn more about features">
          Discover Features
        </a>
      </section>

      {/* Features Section */}
      <section id="features" className="features" aria-label="Key Features of Food Inspection Portal">
        <div className="feature" tabIndex="0">
          <h3>Real-Time Tracking</h3>
          <p>
            Follow inspections live with GPS routes and video streaming to
            maintain transparency and accountability.
          </p>
        </div>
        <div className="feature" tabIndex="0">
          <h3>Certificate Management</h3>
          <p>
            Upload lab certificates, track expiry dates, and get instant alerts
            to stay compliant effortlessly.
          </p>
        </div>
        <div className="feature" tabIndex="0">
          <h3>Comprehensive Dashboard</h3>
          <p>
            Visualize inspection data through intuitive charts and reports,
            helping you make informed decisions quickly.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" aria-label="Contact Information">
        <h2>Contact Us</h2>
        <p>Email: <a href="mailto:support@foodinspection.com">support@foodinspection.com</a></p>
        <p>Phone: <a href="tel:+1234567890">+1 (234) 567-890</a></p>
        <p>Address: 123 Food Safety Blvd, Compliance City, FS 45678</p>
      </section>

      {/* Footer */}
      <footer role="contentinfo">
        &copy; 2025 Food Inspection Portal. All rights reserved.
      </footer>
    </div>
  );
}