import { Button, Card } from 'react-bootstrap';
import type { Strategy } from '../recovery_strategies_types';
import { mediaUrl } from '../api/recovery_strategies_http';
import { StrategyMetrics } from './recovery_strategies_metrics';
import { StrategyImage } from './recovery_strategies_media';

interface StrategyCardProps {
    strategy: Strategy;
    onOpen: (id: number) => void;
    onLike: (id: number, liked: 0 | 1) => void;
    onDelete: (id: number) => void;
    authenticated: boolean;
    disabled: boolean;
}

export function StrategyCard({ strategy, onOpen, onLike, onDelete, authenticated, disabled }: StrategyCardProps) {
    return (
        <Card className="strategy-card h-100">
            <button type="button" className="card-image-button" aria-label={`Подробнее: ${strategy.title}`} disabled={disabled} onClick={() => onOpen(strategy.id)}>
                <StrategyImage src={mediaUrl(strategy.image_url)} alt={strategy.title} className="card-cover" />
            </button>
            <Card.Body>
                <Card.Title>{strategy.title}</Card.Title>
                <Card.Text className="small muted-clamp">{strategy.short_description}</Card.Text>
                <StrategyMetrics strategy={strategy} canLike={authenticated} disabled={disabled} onLike={onLike} />
            </Card.Body>
            <Card.Footer>
                <Button variant="info" size="sm" disabled={disabled} onClick={() => onOpen(strategy.id)}>Подробнее</Button>
                {authenticated && !!strategy.is_creator && (
                    <Button variant="outline-info" size="sm" disabled={disabled} onClick={() => onDelete(strategy.id)}>Удалить</Button>
                )}
            </Card.Footer>
        </Card>
    );
}
