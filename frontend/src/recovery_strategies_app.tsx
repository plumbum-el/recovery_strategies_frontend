import {useEffect} from 'react';
import {Alert,Spinner} from 'react-bootstrap';
import {BottomNav} from './components/recovery_strategies_bottom_nav';
import {CatalogPage} from './pages/recovery_strategies_catalog_page';
import {FeedPage} from './pages/recovery_strategies_feed_page';
import {LoginPage} from './pages/recovery_strategies_login_page';
import {CreatePage} from './pages/recovery_strategies_create_page';
import {recoveryStrategiesLoad,recoveryStrategiesDelete,recoveryStrategiesLike,recoveryStrategiesUiActions,recoveryStrategiesAuthActions,recoveryStrategiesFilterActions} from './store/recovery_strategies_store';
import {recoveryStrategiesAuthHttp,errorText} from './api/recovery_strategies_http';
import {useRecoveryStrategiesDispatch,useRecoveryStrategiesSelector} from './store/recovery_strategies_hooks';
export default function App(){
 const dispatch=useRecoveryStrategiesDispatch();
 const page=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesUI.page);
 const authenticated=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesAuth.authenticated);
 const {busy,loading,error}=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesData);
 const authBusy=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesAuth.busy);
 useEffect(()=>{void dispatch(recoveryStrategiesLoad())},[dispatch]);
 async function deleteOne(id:number){if(!window.confirm('Удалить свою стратегию?'))return;const res=await dispatch(recoveryStrategiesDelete(id));if(recoveryStrategiesDelete.fulfilled.match(res))void dispatch(recoveryStrategiesLoad())}
 async function likeOne(id:number,liked:0|1){await dispatch(recoveryStrategiesLike({id,liked}))}
 async function logout(){
  dispatch(recoveryStrategiesAuthActions.loginStart());
  try {
   await recoveryStrategiesAuthHttp.post('/users/logout');
   dispatch(recoveryStrategiesAuthActions.logoutSuccess());
   dispatch(recoveryStrategiesFilterActions.resetFilters());
   dispatch(recoveryStrategiesUiActions.navigate('feed'));
   void dispatch(recoveryStrategiesLoad({search:'',minTime:'',maxTime:''}));
  } catch(e){dispatch(recoveryStrategiesAuthActions.loginFailure(errorText(e)));}
 }
 const block=busy||authBusy;
 return <div className="app-shell"><div className="phone-status"><span>09:41</span><span aria-hidden="true">▥ ▰</span></div><header className="app-header"><span className="brand-mark">↻</span><span>Recovery <b>Strategies</b></span><small>ЛР №6 · React + Redux Toolkit {authenticated?'· пользователь':'· гость'}</small></header>
 {error&&<div className="container mt-2"><Alert variant="warning">{error}</Alert></div>}
 {page==='feed'?<FeedPage onLike={(id,v)=>void likeOne(id,v)}/>:
 page==='catalog'?<CatalogPage onOpen={id=>dispatch(recoveryStrategiesUiActions.openStrategy(id))} onDelete={id=>void deleteOne(id)} onLike={(id,v)=>void likeOne(id,v)}/>:
 page==='create'?<CreatePage/>:<LoginPage/>}
 {(block||loading)&&<div className="request-overlay" role="status"><Spinner animation="border"/><span>Выполняется запрос...</span></div>}
 <BottomNav page={page} authenticated={authenticated} disabled={block} onNavigate={p=>dispatch(recoveryStrategiesUiActions.navigate(p))} onLogout={()=>void logout()}/>
 </div>;
}
