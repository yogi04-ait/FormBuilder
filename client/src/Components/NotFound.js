import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css'; // Importing the modular CSS file

const NotFound = () => {
    return (
        <div className="notfound-container">
            <div className="notfound-content">
                <h1 className="notfound-heading">404</h1>
                <p className="notfound-message">Page Not Found</p>
                <Link to="/" className="notfound-link">Go back to Home</Link>
            </div>
        </div>
    );
};

export default NotFound;
