// src/pages/About.jsx
import './About.css'; // ✅ custom CSS import

export default function About() {
  return (
    <div className="about-container">
      <div className="about-content">
        <h2 className="about-title">About Us</h2>
        <p className="about-description">
          We are committed to revolutionizing food inspection by providing tools that enable transparency,
          real-time tracking, and complete digital management of food safety procedures.
        </p>

        <div className="about-box mission">
          <h3>📌 Our Mission</h3>
          <p>
            To ensure that food safety is not compromised at any stage — from farm to fork — using technology,
            real-time data, and secure systems.
          </p>
        </div>

        <div className="about-box contact">
          <h3>📬 Contact Us</h3>
          <p>Email: <a href="mailto:support@foodp.com">support@foodp.com</a></p>
          <p>Phone: <a href="tel:+1234567890">+1 (234) 567-890</a></p>
          <p>Address: 123 Food Safety Blvd, Compliance City, FS 45678</p>
        </div>

        <div className="about-benefits">
          <h3>🔍 Key Benefits</h3>
          <ul>
            <li>Real-time inspection tracking with video feed</li>
            <li>Secure login and role-based dashboard</li>
            <li>Certificate uploads with expiry alerts</li>
            <li>Mobile and desktop responsive interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
