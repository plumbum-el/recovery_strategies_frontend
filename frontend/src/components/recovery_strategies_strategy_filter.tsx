import { Button, Form } from 'react-bootstrap';
import type { FilterValues } from '../recovery_strategies_types';

const SLIDER_MIN = 0;
const SLIDER_MAX = 1440;
interface FilterProps {
    values: FilterValues;
    disabled: boolean;
    onChange: (value: FilterValues) => void;
    onApply: () => void;
    onReset: () => void;
}

export function StrategyFilter({ values, disabled, onChange, onApply, onReset }: FilterProps) {
    const left = Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, Number(values.minTime || SLIDER_MIN)));
    const right = Math.min(SLIDER_MAX, Math.max(left, Number(values.maxTime || SLIDER_MAX)));

    function setLeft(value: string) {
        onChange({ ...values, minTime: value === '' ? '' : String(Math.max(SLIDER_MIN, Math.min(Number(value), right))) });
    }
    function setRight(value: string) {
        onChange({ ...values, maxTime: value === '' ? '' : String(Math.min(SLIDER_MAX, Math.max(Number(value), left))) });
    }

    return (
        <Form className="filter-panel" onSubmit={event => { event.preventDefault(); if (!disabled) onApply(); }}>
            <fieldset disabled={disabled}>
                <Form.Group className="mb-3" controlId="filter-search">
                    <Form.Label>Поиск стратегии</Form.Label>
                    <Form.Control placeholder="Введите название стратегии" value={values.search} onChange={event => onChange({ ...values, search: event.target.value })} />
                </Form.Group>
                <div className="filter-range-title">Время восстановления</div>
                <div className="filter-range-subtitle">Выберите диапазон времени, мин</div>
                <div className="filter-values">
                    <label className="filter-value-box">
                        <span>от</span>
                        <input type="number" min={SLIDER_MIN} max={right} step="1" aria-label="Время от, минут" value={values.minTime} placeholder={String(SLIDER_MIN)} onChange={event => setLeft(event.target.value)} />
                    </label>
                    <label className="filter-value-box">
                        <span>до</span>
                        <input type="number" min={left} max={SLIDER_MAX} step="1" aria-label="Время до, минут" value={values.maxTime} placeholder={String(SLIDER_MAX)} onChange={event => setRight(event.target.value)} />
                    </label>
                </div>
                <div className="range-selector" aria-label="Диапазон времени восстановления">
                    <div className="range-track" />
                    <div className="range-highlight" style={{ left: `${100 * left / SLIDER_MAX}%`, right: `${100 * (SLIDER_MAX - right) / SLIDER_MAX}%` }} />
                    <input className="range-left" type="range" min={SLIDER_MIN} max={SLIDER_MAX} value={left} aria-label="Минимальное время" onChange={event => setLeft(event.target.value)} />
                    <input className="range-right" type="range" min={SLIDER_MIN} max={SLIDER_MAX} value={right} aria-label="Максимальное время" onChange={event => setRight(event.target.value)} />
                </div>
                <div className="range-ends"><span>{left} мин</span><span>{right} мин</span></div>
                <div className="filter-buttons">
                    <Button type="submit" variant="info">Применить</Button>
                    <Button type="button" variant="link" onClick={onReset}>Сбросить</Button>
                </div>
            </fieldset>
        </Form>
    );
}
