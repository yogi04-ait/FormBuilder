import React, { useState } from 'react';
import styles from "../styles/Setting.module.css";
import { FaRegUser } from "react-icons/fa";
import { IoMdLock } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import handleLogout from "../utils/handleLogout";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validateEmail, validatePassword } from '../utils/Validation';

const apiUrl = process.env.REACT_APP_URL;

const Settings = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const notifySuccess = () => toast.success("Profile updated successfully!");
    const notifyError = (message) => toast.error(message);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const newErrors = {};

        // Validate email
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Validate password
        if (newPassword.trim()) {
            if (!oldPassword.trim()) {
                newErrors.oldPassword = 'Old password is required to update the password';
            }
            if (!validatePassword(newPassword)) {
                newErrors.newPassword = 'Password must be 8+ characters long and include at least one special character';
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                const response = await fetch(`${apiUrl}/update-profile`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, oldPassword, newPassword }),
                });

                const data = await response.json();

                if (response.ok) {
                    notifySuccess();
                    setOldPassword('');
                    setNewPassword('');
                } else {
                    setServerError(data.message || 'An error occurred while updating your profile');
                    notifyError(data.message || 'An error occurred while updating your profile');
                }
            } catch (error) {
                const errorMessage = 'Unable to connect to the server. Please try again later.';
                setServerError(errorMessage);
                notifyError(errorMessage);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <ToastContainer />
                <p className={styles.heading}>Settings</p>
                <form onSubmit={handleSubmit} className={styles.settingForm}>
                    <div className={styles.inputGroup}>
                        <FaRegUser />
                        <input
                            type="text"
                            id="name"
                            value={name}
                            placeholder="Name"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <MdEmail />
                        <input
                            type="email"
                            id="email"
                            value={email}
                            placeholder="Update Email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                    <div className={styles.inputGroup}>
                        <IoMdLock />
                        <input
                            type="password"
                            id="oldPassword"
                            value={oldPassword}
                            placeholder="Old Password"
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        {errors.oldPassword && <span className={styles.error}>{errors.oldPassword}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                        <IoMdLock />
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            placeholder="New Password"
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    {errors.newPassword && <span className={styles.error}>{errors.newPassword}</span>}
                    <button type="submit">Update</button>
                </form>
                {serverError && <p className={styles.serverError}>{serverError}</p>}
            </div>
            <div className={styles.logout} onClick={() => handleLogout(navigate)}>
                <div><IoIosLogOut /></div>
                <p>Logout</p>
            </div>
        </div>
    );
};

export default Settings;
