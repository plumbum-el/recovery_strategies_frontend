import {useEffect} from 'react';
import {Badge,Button,Card,Spinner} from 'react-bootstrap';
import {StrategyVideo} from '../components/recovery_strategies_media';
import {mediaUrl} from '../api/recovery_strategies_http';
import {recoveryStrategiesUiActions} from '../store/recovery_strategies_store';
import {useRecoveryStrategiesDispatch,useRecoveryStrategiesSelector} from '../store/recovery_strategies_hooks';

export function FeedPage({onLike}:{onLike:(id:number,liked:0|1)=>void}){
 const dispatch=useRecoveryStrategiesDispatch();
 const {items,source,loading,busy}=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesData);
 const {feedIndex,selectedId}=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesUI);
 const authenticated=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesAuth.authenticated);
 useEffect(()=>{
  if(selectedId!==null){
   const i=items.findIndex(s=>s.id===selectedId);
   if(i>=0)dispatch(recoveryStrategiesUiActions.setFeedIndex(i));
   dispatch(recoveryStrategiesUiActions.clearSelection());
  }
 },[selectedId,items,dispatch]);
 const index=Math.min(feedIndex,Math.max(0,items.length-1));
 const s=items[index];
 const canLike=authenticated&&source==='backend';
 return <main className="page-content feed-page container">
  <div className="feed-head"><h1 className="page-heading">Лента стратегий</h1><span className="text-secondary">{items.length?index+1:0} / {items.length}</span></div>
  <p className="text-secondary small">{source==='mock'?'Гостевой режим · mock':'Режим веб-сервиса'} {loading&&<Spinner size="sm"/>}</p>
  {!s?<p>Стратегий пока нет.</p>:<Card className="feed-card">
   <StrategyVideo src={mediaUrl(s.video_url)} poster={mediaUrl(s.image_url)}/>
   <Card.Body>
    <h2>{s.title}</h2><p>{s.short_description}</p>
    <div className="d-flex gap-2 flex-wrap align-items-center mb-3">
     <Badge>⏱ {s.estimated_time??'—'} мин</Badge>
     <Badge>💰 {s.cost??'—'} ₽</Badge>
     <button type="button" className={`like-count ${s.is_liked?'is-liked':''}`}
       aria-label={s.is_liked?'Убрать лайк':'Поставить лайк'}
       aria-pressed={!!s.is_liked}
       title={canLike?'Нажмите, чтобы поставить или убрать лайк':'Лайки доступны после входа'}
       disabled={!canLike||busy||loading}
       onClick={()=>onLike(s.id,s.is_liked?0:1)}>
       <span aria-hidden="true">{s.is_liked?'♥':'♡'}</span> {s.likes_count}
     </button>
    </div>
    <Button variant="info" disabled={busy||loading||items.length<2}
      onClick={()=>dispatch(recoveryStrategiesUiActions.setFeedIndex((index+1)%items.length))}>
      Следующая →
    </Button>
   </Card.Body>
  </Card>}
 </main>;
}
