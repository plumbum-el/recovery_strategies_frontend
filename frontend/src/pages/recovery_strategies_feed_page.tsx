import { useEffect } from 'react';
import { Button, Card, Spinner } from 'react-bootstrap';
import { StrategyVideo } from '../components/recovery_strategies_media';
import { StrategyMetrics } from '../components/recovery_strategies_metrics';
import { mediaUrl } from '../api/recovery_strategies_http';
import { recoveryStrategiesUiActions } from '../store/recovery_strategies_store';
import { useRecoveryStrategiesDispatch, useRecoveryStrategiesSelector } from '../store/recovery_strategies_hooks';

export function FeedPage({ onLike }: { onLike: (id: number, liked: 0 | 1) => void }) {
    const dispatch = useRecoveryStrategiesDispatch();
    const { items, source, loading, busy } = useRecoveryStrategiesSelector(state => state.recoveryStrategiesData);
    const { feedIndex, selectedId } = useRecoveryStrategiesSelector(state => state.recoveryStrategiesUI);
    const authenticated = useRecoveryStrategiesSelector(state => state.recoveryStrategiesAuth.authenticated);

    const selectedIndex = selectedId === null ? -1 : items.findIndex(item => item.id === selectedId);
    const index = selectedIndex >= 0 ? selectedIndex : Math.min(feedIndex, Math.max(0, items.length - 1));
    const strategy = items[index];
    const canLike = authenticated && source === 'backend';

    useEffect(() => {
        if (selectedId !== null) {
            if (selectedIndex >= 0) dispatch(recoveryStrategiesUiActions.setFeedIndex(selectedIndex));
            dispatch(recoveryStrategiesUiActions.clearSelection());
        }
    }, [selectedId, selectedIndex, dispatch]);

    return (
        <main className="page-content feed-page container">
            <div className="feed-head">
                <h1 className="page-heading">Лента стратегий</h1>
                <span className="text-secondary">{items.length ? index + 1 : 0} / {items.length}</span>
            </div>
            <p className="text-secondary small">
                {source === 'mock' ? 'Гостевой режим · mock' : 'Режим веб-сервиса'} {loading && <Spinner size="sm" />}
            </p>
            {!strategy ? <p>Стратегий пока нет.</p> : (
                <Card className="feed-card">
                    <StrategyVideo key={strategy.id} src={mediaUrl(strategy.video_url)} poster={mediaUrl(strategy.image_url)} />
                    <Card.Body>
                        <h2>{strategy.title}</h2>
                        <p>{strategy.short_description}</p>
                        <StrategyMetrics strategy={strategy} canLike={canLike} disabled={busy || loading} onLike={onLike} />
                        <Button variant="info" disabled={busy || loading || items.length < 2} onClick={() => dispatch(recoveryStrategiesUiActions.setFeedIndex((index + 1) % items.length))}>
                            Следующая →
                        </Button>
                    </Card.Body>
                </Card>
            )}
        </main>
    );
}
