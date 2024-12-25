import React from 'react'
import Logo from '../Assets/logo.png'
import style from '../styles/Landing.module.css'
import mainImg from '../Assets/Container.png'
import Footer from './Footer';
import { Link } from 'react-router-dom';


const Landing = () => {
    return (
        <div className={style.landing}>
            <div className={style.header}>
                <div className={style.headLogo}>
                    <img src={Logo} alt='logo' />
                    <p>FormBot</p>
                </div>
                <div className={style.buttons}>
                    <Link to="/login"><button className={style.btn1}  > Sign in</button></Link>
                    <button className={style.btn2}>Create a FormBot</button>
                </div>
            </div>
            <div className={style.body}>
                <img src={mainImg} alt='landing-img' />
            </div>
            <Footer />
        </div>
    )
}

export default Landing