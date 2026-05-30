import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useTheme } from '../../context/ThemeContext.jsx';
import { createRuRaveMuiTheme } from '../../theme/muiDateTheme.js';
import {
    formatDateRangeLabel,
    getDefaultDateRange,
    normalizeDateRange,
    parseIsoDate,
} from '../../utils/dateRange.js';
import './DateFilter.css';
import '../../App.css';

const isoToDayjs = (iso) => (iso ? dayjs(parseIsoDate(iso)) : null);

const todayDayjs = () => dayjs().startOf('day');

const syncPendingFromRange = (fromIso, toIso) => ({
    start: isoToDayjs(fromIso),
    end: isoToDayjs(toIso),
    awaitingEnd: !fromIso || !toIso,
});

const DateFilter = ({
    dateFrom,
    dateTo,
    onRangeChange,
    concertDates = [],
    onMonthChange,
    disabled = false,
}) => {
    const { theme: appTheme } = useTheme();
    const muiTheme = useMemo(() => createRuRaveMuiTheme(appTheme), [appTheme]);

    const appliedRange = useMemo(
        () => normalizeDateRange({ from: dateFrom, to: dateTo }),
        [dateFrom, dateTo]
    );

    const defaultRange = useMemo(() => getDefaultDateRange(), []);

    const [isOpen, setIsOpen] = useState(false);
    const initialPending = syncPendingFromRange(appliedRange.from, appliedRange.to);
    const [pendingStart, setPendingStart] = useState(initialPending.start);
    const [pendingEnd, setPendingEnd] = useState(initialPending.end);
    const [awaitingEnd, setAwaitingEnd] = useState(initialPending.awaitingEnd);
    const [calendarMonth, setCalendarMonth] = useState(todayDayjs);
    const triggerRef = useRef(null);
    const dialogTitleId = useId();

    const focusCalendarOnToday = useCallback(() => {
        const today = todayDayjs();
        setCalendarMonth(today);
        onMonthChange?.(today.year(), today.month());
    }, [onMonthChange]);

    const resetPendingToRange = useCallback((fromIso, toIso) => {
        const next = syncPendingFromRange(fromIso, toIso);
        setPendingStart(next.start);
        setPendingEnd(next.end);
        setAwaitingEnd(next.awaitingEnd);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            resetPendingToRange(appliedRange.from, appliedRange.to);
        }
    }, [appliedRange.from, appliedRange.to, isOpen, resetPendingToRange]);

    const openModal = useCallback(() => {
        resetPendingToRange(appliedRange.from, appliedRange.to);
        focusCalendarOnToday();
        setIsOpen(true);
    }, [appliedRange.from, appliedRange.to, focusCalendarOnToday, resetPendingToRange]);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        triggerRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeModal]);

    const handleDaySelect = (day) => {
        if (!day) {
            return;
        }

        if (!awaitingEnd || !pendingStart) {
            setPendingStart(day.startOf('day'));
            setPendingEnd(null);
            setAwaitingEnd(true);
            return;
        }

        if (day.isBefore(pendingStart, 'day')) {
            setPendingEnd(pendingStart);
            setPendingStart(day.startOf('day'));
        } else {
            setPendingEnd(day.startOf('day'));
        }
        setAwaitingEnd(false);
    };

    const handleApply = () => {
        if (pendingStart && pendingEnd) {
            onRangeChange?.({
                from: pendingStart.format('YYYY-MM-DD'),
                to: pendingEnd.format('YYYY-MM-DD'),
            });
            closeModal();
        }
    };

    const handleReset = () => {
        resetPendingToRange(defaultRange.from, defaultRange.to);
        onRangeChange?.(defaultRange);
        focusCalendarOnToday();
    };

    const handleMonthChange = (month) => {
        setCalendarMonth(month);
        onMonthChange?.(month.year(), month.month());
    };

    const canApply = Boolean(pendingStart && pendingEnd);
    const triggerLabel = formatDateRangeLabel(appliedRange.from, appliedRange.to);
    const calendarValue = pendingEnd ?? pendingStart ?? calendarMonth;
    const concertDateSet = useMemo(() => new Set(concertDates), [concertDates]);

    const pendingRangeLabel =
        pendingStart && pendingEnd
            ? formatDateRangeLabel(
                  pendingStart.format('YYYY-MM-DD'),
                  pendingEnd.format('YYYY-MM-DD')
              )
            : pendingStart
              ? `${pendingStart.format('DD.MM.YYYY')} — …`
              : null;

    const instructionText = (() => {
        if (pendingStart && pendingEnd && !awaitingEnd) {
            return `Выбран период: ${pendingRangeLabel}. Нажмите день, чтобы выбрать новое начало`;
        }
        if (awaitingEnd && pendingStart) {
            return `Начало: ${pendingStart.format('DD.MM.YYYY')}. Выберите дату окончания`;
        }
        return 'Выберите дату начала периода';
    })();

    const daySlotProps = useCallback(
        ({ day }) => {
            const iso = day.format('YYYY-MM-DD');
            const hasConcert = concertDateSet.has(iso);
            const isStart = pendingStart?.isSame(day, 'day');
            const isEnd = pendingEnd?.isSame(day, 'day');
            const inRange =
                pendingStart &&
                pendingEnd &&
                !day.isBefore(pendingStart, 'day') &&
                !day.isAfter(pendingEnd, 'day');

            return {
                sx: {
                    position: 'relative',
                    ...(inRange && {
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(155, 89, 182, 0.35)'
                                : 'rgba(125, 60, 152, 0.2)',
                    }),
                    ...((isStart || isEnd) && {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover, &:focus': {
                            backgroundColor: 'primary.main',
                        },
                    }),
                    ...(hasConcert && {
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 4,
                            left: '50%',
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            transform: 'translateX(-50%)',
                        },
                    }),
                },
            };
        },
        [concertDateSet, pendingStart, pendingEnd]
    );

    return (
        <div className="date-filter">
            <button
                ref={triggerRef}
                type="button"
                className={`date-filter__trigger${disabled ? ' date-filter__trigger--disabled' : ''}`}
                onClick={() => !disabled && (isOpen ? closeModal() : openModal())}
                disabled={disabled}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
            >
                <img
                    className="date-filter__icon"
                    src="/src/assets/icons/date.png"
                    alt=""
                />
                <span className="date-filter__label">{triggerLabel}</span>
                <span className={`date-filter__arrow ${isOpen ? 'open' : ''}`} aria-hidden="true">
                    ▼
                </span>
            </button>

            {isOpen && !disabled && (
                <div className="date-filter__overlay" onClick={closeModal}>
                    <div
                        className="date-filter__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={dialogTitleId}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ThemeProvider theme={muiTheme}>
                            <LocalizationProvider
                                dateAdapter={AdapterDayjs}
                                adapterLocale="ru"
                            >
                                <div className="date-filter__header">
                                    <h3 id={dialogTitleId} className="date-filter__title">
                                        Период концертов
                                    </h3>
                                    <button
                                        type="button"
                                        className="date-filter__close"
                                        onClick={closeModal}
                                        aria-label="Закрыть"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <p className="date-filter__instruction">{instructionText}</p>

                                <div className="date-filter__mui">
                                    <DateCalendar
                                        key={calendarMonth.format('YYYY-MM')}
                                        referenceDate={calendarMonth}
                                        value={calendarValue}
                                        onChange={handleDaySelect}
                                        onMonthChange={handleMonthChange}
                                        slotProps={{ day: daySlotProps }}
                                    />
                                </div>

                                <p className="date-filter__hint">
                                    По умолчанию: сегодня — +1 год. Точки — дни с концертами
                                </p>

                                <div className="date-filter__actions">
                                    <button
                                        type="button"
                                        className="date-filter__reset"
                                        onClick={handleReset}
                                    >
                                        По умолчанию
                                    </button>
                                    <button
                                        type="button"
                                        className="date-filter__apply"
                                        onClick={handleApply}
                                        disabled={!canApply}
                                    >
                                        Применить
                                    </button>
                                </div>
                            </LocalizationProvider>
                        </ThemeProvider>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateFilter;
