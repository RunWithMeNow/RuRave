import { useState } from 'react';
import './Banner.css';
import '../../App.css';

const Banner = ({ imageUrl, alt = 'RuRave — афиша' }) => {
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
        </div>
    );
};

export default Banner;
