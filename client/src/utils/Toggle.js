import React from 'react'
import style from './Toggle.module.css'
const Toggle = () => {
    const label = 'button'
    return (
        <div className="container">

            <div className={style.toggleswitch} >
                <input
                    type="checkbox"
                    className={style.checkbox}
                    name={label}
                    id={label}
                />
                <label className={style.label} htmlFor={label}>
                    <span className={style.inner} />
                    <span className={style.switch} />
                </label>
            </div>
        </div>
    )
}

export default Toggle