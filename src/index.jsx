import './style.css'
import { createRoot } from 'react-dom/client'
import App from './App'
import { useState } from 'react'

function Overlay() {
    const [clicked, setClicked] = useState(false)
    return (
        <>
            {clicked && <App />}
            <div className="container" style={{ cursor: clicked ? "none" : "auto" }}>
                <div className={`fullscreen bg ready"} ${clicked && "clicked"}`}>
                    <div className="stack">
                        <a href="#" onClick={() => setClicked(true)}>
                            {"Play"}
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}

createRoot(document.querySelector('#root')).render(<Overlay />)