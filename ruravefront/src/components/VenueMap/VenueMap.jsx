import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { geocodeAddress, openStreetMapSearchUrl } from './geocode.js';
import './VenueMap.css';
import 'leaflet/dist/leaflet.css';
import '../../App.css';

// Vite: default marker assets
// eslint-disable-next-line no-underscore-dangle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
});

const DEFAULT_ZOOM = 16;

const VenueMap = ({ mapSearchQuery, place, venueAddress }) => {
    const [coords, setCoords] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            setCoords(null);

            try {
                const result = await geocodeAddress(mapSearchQuery);
                if (cancelled) {
                    return;
                }
                if (!result) {
                    setError('not_found');
                    return;
                }
                setCoords(result);
            } catch {
                if (!cancelled) {
                    setError('failed');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [mapSearchQuery]);

    const osmLink = openStreetMapSearchUrl(mapSearchQuery);
    const popupLines = [place, venueAddress].filter(Boolean);

    return (
        <section className="venue-map" aria-labelledby="concert-map-heading">
            <h2 id="concert-map-heading" className="venue-map__title">
                На карте
            </h2>

            {loading && (
                <div className="venue-map__panel venue-map__panel--loading" aria-busy="true">
                    <p className="venue-map__status">Загрузка карты…</p>
                </div>
            )}

            {!loading && error && (
                <div className="venue-map__panel venue-map__panel--error">
                    <p className="venue-map__status">
                        {error === 'not_found'
                            ? 'Не удалось найти адрес на карте.'
                            : 'Не удалось загрузить карту. Проверьте подключение к интернету.'}
                    </p>
                    <a
                        href={osmLink}
                        className="venue-map__external page__link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Открыть в OpenStreetMap
                    </a>
                </div>
            )}

            {!loading && coords && (
                <div className="venue-map__frame">
                    <MapContainer
                        center={[coords.lat, coords.lon]}
                        zoom={DEFAULT_ZOOM}
                        scrollWheelZoom={false}
                        className="venue-map__map"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[coords.lat, coords.lon]}>
                            <Popup>
                                {popupLines.map((line) => (
                                    <span key={line} className="venue-map__popup-line">
                                        {line}
                                    </span>
                                ))}
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            )}
        </section>
    );
};

export default VenueMap;
