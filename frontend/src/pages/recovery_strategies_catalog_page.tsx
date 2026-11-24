import { Alert, Spinner } from 'react-bootstrap';
import { StrategyCard } from '../components/recovery_strategies_strategy_card';
import { StrategyFilter } from '../components/recovery_strategies_strategy_filter';
import { recoveryStrategiesFilterActions, recoveryStrategiesInitialFilter, recoveryStrategiesLoad } from '../store/recovery_strategies_store';
import { useRecoveryStrategiesDispatch, useRecoveryStrategiesSelector } from '../store/recovery_strategies_hooks';

interface CatalogProps {
    onOpen: (id: number) => void;
    onDelete: (id: number) => void;
    onLike: (id: number, liked: 0 | 1) => void;
}

export function CatalogPage({ onOpen, onDelete, onLike }: CatalogProps) {
    const dispatch = useRecoveryStrategiesDispatch();
    const filters = useRecoveryStrategiesSelector(state => state.recoveryStrategiesFilters);
    const { items, source, loading, busy } = useRecoveryStrategiesSelector(state => state.recoveryStrategiesData);
    const authenticated = useRecoveryStrategiesSelector(state => state.recoveryStrategiesAuth.authenticated);

    function apply() {
        void dispatch(recoveryStrategiesLoad(filters));
    }
    function reset() {
        dispatch(recoveryStrategiesFilterActions.resetFilters());
        void dispatch(recoveryStrategiesLoad(recoveryStrategiesInitialFilter));
    }

    return (
        <main className="page-content catalog-page">
            <h1 className="page-heading">Стратегии восстановления</h1>
            <StrategyFilter values={filters} disabled={loading || busy} onChange={value => dispatch(recoveryStrategiesFilterActions.setFilters(value))} onApply={apply} onReset={reset} />
            <p className="result-count">
                Найдено стратегий: {items.length} {loading && <Spinner size="sm" />}
                <span className="data-source">{source === 'mock' ? 'mock' : 'веб-сервис'}</span>
            </p>
            {!loading && items.length === 0 ? (
                <Alert variant="secondary">Стратегии не найдены.</Alert>
            ) : (
                <div className="strategy-grid">
                    {items.map(strategy => (
                        <StrategyCard key={strategy.id} strategy={strategy} disabled={busy || loading} authenticated={authenticated && source === 'backend'} onOpen={onOpen} onDelete={onDelete} onLike={onLike} />
                    ))}
                </div>
            )}
        </main>
    );
}
