import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import style from '../styles/Login.module.css';
import img from "../Assets/img.png";
import elipse1 from '../Assets/Ellipse1.png';
import elipse2 from "../Assets/Ellipse2.png";
import googleLogo from "../Assets/google.png";
const apiUrl = process.env.REACT_APP_URL;

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(password)) {
            newErrors.password = 'Password must be 8+ characters long and include at least one special character';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                const response = await fetch(`${apiUrl}/login`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                console.log(data);

                if (response.ok) {
                    console.log('Login successful:', data);
                    navigate("/workspace");

                } else {
                    console.error('Error logging in:', data);
                    setErrors({ server: data.message || 'An error occurred' });
                }
            } catch (error) {
                console.error('Error connecting to the server:', error);
                setErrors({ server: 'Unable to connect to the server. Please try again later.' });
            }
        }
    };


    return (
        <div className={style.main}>
            <form onSubmit={handleSubmit} className={style.form}>
                <div className={style.div}>
                    <label className={errors.email ? style.errorLabel : ''}>Email</label>
                    <input
                        type='email'
                        id='email'
                        placeholder='Enter your email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={errors.email ? style.errorInput : ''}
                    />
                    {errors.email && <span className={style.error}>{errors.email}</span>}
                </div>
                <div className={style.div}>
                    <label className={errors.password ? style.errorLabel : ''}>Password</label>
                    <input
                        type='password'
                        id='password'
                        placeholder='Your password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? style.errorInput : ''}
                    />
                    {errors.password && <span className={style.error}>{errors.password}</span>}
                </div>
                {errors.server && <span className={style.error}>{errors.server}</span>}
                <button type='submit'>Log In</button>
                <p>OR</p>
                <button type='button' className={style.btn2}>
                    <img src={googleLogo} alt='google-logo' /> Sign in with Google
                </button>
                <p> Don't have an account ? <Link to='/register'>Register now</Link></p>
            </form>
            <img src={img} width="280" alt='img' className={style.img1} />
            <img src={elipse1} width="120px" alt='img' className={style.img2} />
            <img src={elipse2} height="120px" alt='img' width="65px" className={style.img3} />
        </div>
    );
};

export default Login;
