import { useState } from 'react';
import { CITY_IMAGE_FALLBACK, resolveCityImageUrl } from '../../utils/cityImage.js';
import './CityImage.css';

const CityImage = ({
    imageUrl,
    alt = '',
    className = '',
    loading = 'lazy',
    decorative = false,
}) => {
    const [src, setSrc] = useState(() => resolveCityImageUrl(imageUrl));

    const handleError = () => {
        if (src !== CITY_IMAGE_FALLBACK) {
            setSrc(CITY_IMAGE_FALLBACK);
        }
    };

    return (
        <img
            className={`city-image${className ? ` ${className}` : ''}`}
            src={src}
            alt={decorative ? '' : alt}
            loading={loading}
            decoding="async"
            onError={handleError}
        />
    );
};

export default CityImage;
