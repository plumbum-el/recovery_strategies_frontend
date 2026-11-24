import type { Strategy } from '../recovery_strategies_types';

interface MetricsProps {
    strategy: Strategy;
    canLike: boolean;
    disabled: boolean;
    onLike: (id: number, liked: 0 | 1) => void;
}

export function StrategyMetrics({ strategy, canLike, disabled, onLike }: MetricsProps) {
    return (
        <div className="strategy-metrics">
            <span className="metric-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="13" r="8" />
                    <path d="M12 9v4l3 2M9 2h6M12 2v3" strokeLinecap="round" />
                </svg>
                {strategy.estimated_time ?? '—'} мин
            </span>
            <span className="metric-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <circle cx="12" cy="12" r="2.5" />
                    <path d="M3 9h3M18 15h3" strokeLinecap="round" />
                </svg>
                {strategy.cost ?? '—'} ₽
            </span>
            <button type="button" className="like-count" aria-label={strategy.is_liked ? 'Убрать лайк' : 'Поставить лайк'} aria-pressed={!!strategy.is_liked} title={canLike ? 'Поставить или убрать лайк' : 'Лайки доступны после входа'} disabled={!canLike || disabled} onClick={event => {
                event.stopPropagation();
                onLike(strategy.id, strategy.is_liked ? 0 : 1);
            }} onKeyDown={event => event.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill={strategy.is_liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" strokeLinejoin="round" />
                </svg>
                {strategy.likes_count}
            </button>
        </div>
    );
}
