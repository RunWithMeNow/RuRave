import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useTheme } from '../../context/ThemeContext.jsx';
import { createRuRaveMuiTheme } from '../../theme/muiDateTheme.js';
import {
    formatDateFilterLabel,
    formatDateRangeLabel,
    formatSingleDateLabel,
    getWidgetDefaultRange,
    isSingleDayRange,
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
    onDefaultsReset,
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

    const widgetDefaultRange = useMemo(() => getWidgetDefaultRange(), []);

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
        if (!pendingStart) {
            return;
        }

        const from = pendingStart.format('YYYY-MM-DD');
        const to = (pendingEnd ?? pendingStart).format('YYYY-MM-DD');
        onRangeChange?.({ from, to });
        closeModal();
    };

    const handleReset = () => {
        resetPendingToRange(widgetDefaultRange.from, widgetDefaultRange.to);
        onDefaultsReset?.();
        focusCalendarOnToday();
    };

    const handleMonthChange = (month) => {
        setCalendarMonth(month);
        onMonthChange?.(month.year(), month.month());
    };

    const canApply = Boolean(pendingStart);
    const appliedFrom = appliedRange.from;
    const appliedTo = appliedRange.to;
    const triggerLabel = formatDateFilterLabel(appliedFrom, appliedTo);
    const concertDateSet = useMemo(() => new Set(concertDates), [concertDates]);

    const pendingFromIso = pendingStart?.format('YYYY-MM-DD');
    const pendingToIso = (pendingEnd ?? pendingStart)?.format('YYYY-MM-DD');

    const pendingSelectionLabel = pendingStart
        ? formatDateFilterLabel(pendingFromIso, pendingToIso)
        : formatSingleDateLabel();

    const instructionText = (() => {
        if (pendingStart && pendingEnd && !awaitingEnd) {
            const selectionHint = isSingleDayRange(pendingFromIso, pendingToIso)
                ? `Выбран день: ${pendingSelectionLabel}. Нажмите день, чтобы выбрать другую дату`
                : `Выбран период: ${pendingSelectionLabel}. Нажмите день, чтобы выбрать новое начало`;
            return selectionHint;
        }
        if (awaitingEnd && pendingStart) {
            return `Начало: ${formatSingleDateLabel(pendingFromIso)}. Выберите дату окончания или нажмите «Применить» для одного дня`;
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
                <span className="date-filter__label">
                    {isSingleDayRange(appliedFrom, appliedTo) ? (
                        <time dateTime={appliedFrom || appliedTo}>{triggerLabel}</time>
                    ) : (
                        <span>
                            {formatDateRangeLabel(appliedFrom, appliedTo)}
                        </span>
                    )}
                </span>
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
                                        referenceDate={calendarMonth}
                                        value={null}
                                        onChange={handleDaySelect}
                                        onMonthChange={handleMonthChange}
                                        slotProps={{ day: daySlotProps }}
                                    />
                                </div>

                                <p className="date-filter__hint">
                                    «По умолчанию»: в календаре — сегодня, афиша — на год вперёд. Точки — дни с
                                    концертами
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
