import { Button, Card } from 'react-bootstrap';
import { StrategyVideo } from '../components/recovery_strategies_media';
import { StrategyMetrics } from '../components/recovery_strategies_metrics';
import { mediaUrl } from '../api/recovery_strategies_http';
import { useRecoveryStrategiesDispatch, useRecoveryStrategiesSelector } from '../store/recovery_strategies_hooks';
import { recoveryStrategiesUiActions } from '../store/recovery_strategies_store';

export function DetailPage({ onLike }: { onLike: (id: number, liked: 0 | 1) => void }) {
    const dispatch = useRecoveryStrategiesDispatch();
    const selectedId = useRecoveryStrategiesSelector(state => state.recoveryStrategiesUI.selectedId);
    const { items, source, busy, loading } = useRecoveryStrategiesSelector(state => state.recoveryStrategiesData);
    const authenticated = useRecoveryStrategiesSelector(state => state.recoveryStrategiesAuth.authenticated);
    const strategy = items.find(item => item.id === selectedId);

    function backToCatalog() {
        // Do not reset the Redux filter or dispatch an unfiltered request.
        dispatch(recoveryStrategiesUiActions.navigate('catalog'));
    }

    return (
        <main className="page-content feed-page detail-page">
            <div className="detail-heading">
                <Button variant="outline-info" onClick={backToCatalog}>← К плитке</Button>
                <h1 className="page-heading">Подробнее</h1>
            </div>
            {!strategy ? <p>Стратегия не найдена.</p> : (
                <Card className="feed-card">
                    <StrategyVideo src={mediaUrl(strategy.video_url)} poster={mediaUrl(strategy.image_url)} />
                    <Card.Body>
                        <h2>{strategy.title}</h2>
                        <p>{strategy.short_description}</p>
                        <StrategyMetrics strategy={strategy} canLike={authenticated && source === 'backend'} disabled={busy || loading} onLike={onLike} />
                    </Card.Body>
                </Card>
            )}
        </main>
    );
}
