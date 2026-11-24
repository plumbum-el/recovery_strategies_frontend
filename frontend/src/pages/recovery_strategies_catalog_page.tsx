import {Alert, Spinner} from 'react-bootstrap';
import {StrategyCard} from '../components/recovery_strategies_strategy_card';
import {StrategyFilter} from '../components/recovery_strategies_strategy_filter';
import {recoveryStrategiesFilterActions,recoveryStrategiesLoad} from '../store/recovery_strategies_store';
import {useRecoveryStrategiesDispatch,useRecoveryStrategiesSelector} from '../store/recovery_strategies_hooks';
export function CatalogPage({onOpen,onDelete,onLike}:{onOpen:(id:number)=>void;onDelete:(id:number)=>void;onLike:(id:number,liked:0|1)=>void}){
 const dispatch=useRecoveryStrategiesDispatch();
 const filters=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesFilters);
 const {items,source,loading,busy}=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesData);
 const authenticated=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesAuth.authenticated);
 const filtered=items.filter(s=>s.title.toLowerCase().includes(filters.search.trim().toLowerCase()) && (filters.minTime===''||Number(s.estimated_time)>=Number(filters.minTime)) && (filters.maxTime===''||Number(s.estimated_time)<=Number(filters.maxTime)));
 const apply=()=>void dispatch(recoveryStrategiesLoad(filters));
 const reset=()=>{dispatch(recoveryStrategiesFilterActions.resetFilters());void dispatch(recoveryStrategiesLoad({search:'',minTime:'',maxTime:''}));};
 return <main className="page-content catalog-page"><h1 className="page-heading">Стратегии восстановления</h1>
 <StrategyFilter values={filters} onChange={v=>dispatch(recoveryStrategiesFilterActions.setFilters(v))} onApply={apply} onReset={reset}/>
 <p className="result-count">Найдено стратегий: {filtered.length} {loading&&<Spinner size="sm"/>} <span className="data-source">{source==='mock'?'mock':'веб-сервис'}</span></p>
 {filtered.length===0?<Alert variant="secondary">Стратегии не найдены.</Alert>:<div className="strategy-grid">
 {filtered.map(s=><StrategyCard key={s.id} strategy={s} disabled={busy||loading} authenticated={authenticated&&source==='backend'} onOpen={onOpen} onDelete={onDelete} onLike={onLike}/>)}</div>}
 </main>;
}
