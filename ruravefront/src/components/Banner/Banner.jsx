import { useState } from 'react';
import { ABOUT_INTRO, BANNER_TAGLINE } from '../../content/siteCopy.js';
import './Banner.css';
import '../../App.css';

const Banner = ({ imageUrl, alt = 'RuRave — афиша', intro = ABOUT_INTRO }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="banner-container">
            {!imageError && imageUrl && (
                <img
                    src={imageUrl}
                    alt={alt}
                    className="banner-image"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    onError={() => setImageError(true)}
                />
            )}
            <div className="banner__hero layout-container">
                <h1 className="banner__title">
                    <span className="banner__title-part banner__title-part--light">Ru</span>
                    <span className="banner__title-part banner__title-part--accent">Rave</span>
                </h1>
                <p className="banner__tagline">{BANNER_TAGLINE}</p>
                {intro ? <p className="banner__intro">{intro}</p> : null}
            </div>
        </div>
    );
};

export default Banner;
