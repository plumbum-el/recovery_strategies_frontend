import {Badge, Button, Card} from 'react-bootstrap';
import type {Strategy} from '../recovery_strategies_types';
import {mediaUrl} from '../api/recovery_strategies_http';
import {StrategyImage} from './recovery_strategies_media';

export function StrategyCard({
  strategy, onOpen, onLike, onDelete, authenticated, disabled
}: {
  strategy: Strategy;
  onOpen: (id:number) => void;
  onLike: (id:number, liked:0|1) => void;
  onDelete: (id:number) => void;
  authenticated: boolean;
  disabled: boolean;
}) {
  return (
    <Card className="strategy-card h-100">
      <div
        onClick={() => !disabled && onOpen(strategy.id)}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' && !disabled) onOpen(strategy.id); }}
      >
        <StrategyImage src={mediaUrl(strategy.image_url)} alt={strategy.title} className="card-cover" />
        <Card.Body>
          <Card.Title>{strategy.title}</Card.Title>
          <Card.Text className="small muted-clamp">{strategy.short_description}</Card.Text>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <Badge>⏱ {strategy.estimated_time ?? '—'} мин</Badge>
            <Badge>💰 {strategy.cost ?? '—'} ₽</Badge>
            <button
              type="button"
              className={`like-count ${strategy.is_liked ? 'is-liked' : ''}`}
              aria-label={strategy.is_liked ? 'Убрать лайк' : 'Поставить лайк'}
              aria-pressed={!!strategy.is_liked}
              title={authenticated ? 'Нажмите, чтобы поставить или убрать лайк' : 'Лайки доступны после входа'}
              disabled={disabled || !authenticated}
              onClick={e => {
                e.stopPropagation();
                onLike(strategy.id, strategy.is_liked ? 0 : 1);
              }}
              onKeyDown={e => e.stopPropagation()}
            >
              <span aria-hidden="true">{strategy.is_liked ? '♥' : '♡'}</span> {strategy.likes_count}
            </button>
          </div>
        </Card.Body>
      </div>
      {authenticated && !!strategy.is_creator &&
        <Card.Footer className="bg-white">
          <Button variant="outline-info" size="sm" disabled={disabled}
            onClick={() => onDelete(strategy.id)}>Удалить</Button>
        </Card.Footer>
      }
    </Card>
  );
}
