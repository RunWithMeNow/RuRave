import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './SelectCityAlert.css';
import '../../App.css';

const VISIBLE_MS = 4000;
const LEAVE_MS = 320;

const SelectCityAlert = ({ show, toastKey = 0, onHidden }) => {
    const [mounted, setMounted] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (!show) {
            setMounted(false);
            setLeaving(false);
            return undefined;
        }

        setMounted(true);
        setLeaving(false);

        const dismissTimer = window.setTimeout(() => {
            setLeaving(true);
        }, VISIBLE_MS);

        return () => {
            window.clearTimeout(dismissTimer);
        };
    }, [show, toastKey]);

    useEffect(() => {
        if (!leaving) {
            return undefined;
        }

        const hideTimer = window.setTimeout(() => {
            setMounted(false);
            setLeaving(false);
            onHidden?.();
        }, LEAVE_MS);

        return () => {
            window.clearTimeout(hideTimer);
        };
    }, [leaving, onHidden]);

    const dismissEarly = () => {
        setLeaving(true);
    };

    if (!mounted) {
        return null;
    }

    return createPortal(
        <div
            className={`select-city-toast${leaving ? ' select-city-toast--leave' : ' select-city-toast--enter'}`}
            role="alert"
            aria-live="assertive"
        >
            <p className="select-city-toast__title">Выберите город</p>
            <p className="select-city-toast__text">
                Чтобы посмотреть площадки, выберите город в афише или в блоке «Города с афишей».
            </p>
            <button
                type="button"
                className="select-city-toast__close"
                onClick={dismissEarly}
                aria-label="Закрыть"
            >
                ✕
            </button>
        </div>,
        document.body
    );
};

export default SelectCityAlert;
