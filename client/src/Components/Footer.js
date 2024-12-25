import React from 'react'
import style from '../styles/Landing.module.css'
import logo from '../Assets/logo.png'
import { CiShare1 } from "react-icons/ci";
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className={style.footer}>
            <div className={style.container1}>
                <div className={style.container1Img}>
                    <img src={logo} alt="Logo" />
                    <p>FormBot</p>
                </div>
                <div>
                    Made with ❤️ by <br />
                    <Link>@cuvette</Link>
                </div>
            </div>
            <div className={style.container2}>
                <div className={style.heading} >Product</div>
                <div><Link>Status</Link> <CiShare1 />
                </div>
                <div><Link>Documentation</Link> <CiShare1 />
                </div>
                <div><Link>Roadmap</Link> <CiShare1 />

                </div>
                <div><Link>Pricing</Link> <CiShare1 />
                </div>
            </div>
            <div className={style.container2}>
                <div className={style.heading} >Community</div>
                <div><Link>Discord</Link> <CiShare1 />
                </div>
                <div><Link>Github repository</Link> <CiShare1 />
                </div>
                <div><Link>Twitter</Link> <CiShare1 />
                </div>
                <div><Link>Linkedn</Link> <CiShare1 />
                </div>
                <div><Link>OSS Friends</Link> <CiShare1 />
                </div>
            </div>
            <div className={style.container2}>
                <div className={style.heading} >Company</div>
                <div><Link>About</Link> <CiShare1 />
                </div>
                <div><Link>Contact</Link> <CiShare1 />
                </div>
                <div><Link>Terms of Service</Link> <CiShare1 />
                </div>
                <div><Link>Privacy Policy</Link> <CiShare1 />
                </div>
            </div>
        </footer>

    )
}

export default Footer