import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import SelectCityAlert from '../components/SelectCityAlert/SelectCityAlert.jsx';
import { scrollToVenuesSection } from '../utils/homeNavScroll.js';

const HomeAfishaNavContext = createContext(null);

export const HomeAfishaNavProvider = ({ children }) => {
    const [selectedCityId, setSelectedCityId] = useState(null);
    const [selectCityToastKey, setSelectCityToastKey] = useState(0);

    const tryNavigateToVenues = useCallback(() => {
        if (!selectedCityId) {
            setSelectCityToastKey((key) => key + 1);
            return;
        }

        scrollToVenuesSection();
        window.history.replaceState(null, '', '/#venues');
    }, [selectedCityId]);

    const handleSelectCityToastHidden = useCallback(() => {
        setSelectCityToastKey(0);
    }, []);

    const value = useMemo(
        () => ({
            setSelectedCityId,
            tryNavigateToVenues,
        }),
        [tryNavigateToVenues]
    );

    return (
        <HomeAfishaNavContext.Provider value={value}>
            {children}
            <SelectCityAlert
                show={selectCityToastKey > 0}
                toastKey={selectCityToastKey}
                onHidden={handleSelectCityToastHidden}
            />
        </HomeAfishaNavContext.Provider>
    );
};

export const useHomeAfishaNav = () => {
    const context = useContext(HomeAfishaNavContext);
    if (!context) {
        throw new Error('useHomeAfishaNav must be used within HomeAfishaNavProvider');
    }
    return context;
};

/** Для Header: контекст может отсутствовать вне провайдера. */
export const useHomeAfishaNavOptional = () => useContext(HomeAfishaNavContext);
