import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import style from '../styles/Login.module.css';
import img from "../Assets/img.png";
import elipse1 from '../Assets/Ellipse1.png';
import elipse2 from "../Assets/Ellipse2.png";
import googleLogo from "../Assets/google.png";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from '../utils/Validation';
const apiUrl = process.env.REACT_APP_URL;


const Signup = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});


    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = 'Username is required';
        }

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

        if (password !== confirmpassword) {
            newErrors.confirmpassword = 'enter same password in both fields';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                const response = await fetch(`${apiUrl}/register`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password, confirmpassword }),
                });

                const data = await response.json();
                if (response.ok) {
                    navigate('/workspace')
                } else {
                    setErrors({ server: data.message || 'An error occurred' });
                }

            } catch (error) {
                setErrors({ server: 'Unable to connect to the server. Please try again later.' });
            }
        }
    };

    return (
        <div className={style.main}>
            
            <form onSubmit={handleSubmit} className={style.form}>
                <div className={style.div}>
                    <label className={errors.username ? style.errorLabel : ''}>Username</label>
                    <input
                        type='text'
                        id='username'
                        placeholder='Enter your username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={errors.username ? style.errorInput : ''}
                    />
                    {errors.username && <span className={style.error}>{errors.username}</span>}
                </div>
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
                <div className={style.div}>
                    <label className={errors.confirmPassword ? style.errorLabel : ''}>Confirm Password</label>
                    <input
                        type='password'
                        id='confirm-password'
                        placeholder='Confirm your password'
                        value={confirmpassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={errors.confirmPassword ? style.errorInput : ''}
                    />
                    {errors.confirmPassword && <span className={style.error}>{errors.confirmPassword}</span>}
                </div>
                {errors.server && <span className={style.error}>{errors.server}</span>}
                <button type='submit'>Sign Up</button>
                <p>OR</p>
                <button type='button' className={style.btn2}>
                    <img src={googleLogo} alt='google-logo' /> Sign Up with Google
                </button>
                <p>Already have an account ? <Link to='/login'>Login now</Link></p>
            </form>
            <img src={img} width="280px" alt='img1' className={style.img1} />
            <img src={elipse1} width="120px" alt='img' className={style.img2} />
            <img src={elipse2} height="120px" alt='img' width="60px" className={style.img3} />
        </div>
    );
};

export default Signup;
