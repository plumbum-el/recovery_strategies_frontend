import {useState} from 'react';
import {Alert,Button,Form,Spinner} from 'react-bootstrap';
import {useRecoveryStrategiesDispatch,useRecoveryStrategiesSelector} from '../store/recovery_strategies_hooks';
import {recoveryStrategiesAuthActions,recoveryStrategiesFilterActions,recoveryStrategiesUiActions,recoveryStrategiesLoad} from '../store/recovery_strategies_store';
import {recoveryStrategiesAuthHttp,errorText} from '../api/recovery_strategies_http';
export function LoginPage(){
 const dispatch=useRecoveryStrategiesDispatch();const {authenticated,username,busy,error}=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesAuth);
 const [name,setName]=useState('');const [password,setPassword]=useState('');const [register,setRegister]=useState(false);
 async function login(e:React.FormEvent){e.preventDefault();dispatch(recoveryStrategiesAuthActions.loginStart());
 try{
  if(register)await recoveryStrategiesAuthHttp.post('/users/register',{username:name,password});
  const {data}=await recoveryStrategiesAuthHttp.post<{username:string;user_id:number}>('/users/login',{username:name,password});
  dispatch(recoveryStrategiesAuthActions.loginSuccess(data));dispatch(recoveryStrategiesUiActions.navigate('catalog'));void dispatch(recoveryStrategiesLoad());
 }catch(e){dispatch(recoveryStrategiesAuthActions.loginFailure(errorText(e)))}
 }
 async function logout(){dispatch(recoveryStrategiesAuthActions.loginStart());try{
  await recoveryStrategiesAuthHttp.post('/users/logout');
  dispatch(recoveryStrategiesAuthActions.logoutSuccess());dispatch(recoveryStrategiesFilterActions.resetFilters());dispatch(recoveryStrategiesUiActions.navigate('feed'));void dispatch(recoveryStrategiesLoad());
 }catch(e){dispatch(recoveryStrategiesAuthActions.loginFailure(errorText(e)))}
 }
 return <main className="page-content container auth-page"><h1 className="page-heading">{authenticated?'Личный кабинет':'Вход в систему'}</h1>
 {error&&<Alert variant="danger">{error}</Alert>}
 {authenticated?<><p>Вы вошли как <b>{username}</b>. Доступно добавление, удаление своих стратегий и лайки.</p><Button variant="danger" disabled={busy} onClick={()=>void logout()}>{busy?<Spinner size="sm"/>:'Выход'}</Button></>:
 <Form className="filter-panel" onSubmit={e=>void login(e)}><Form.Group className="mb-3"><Form.Label>Имя пользователя</Form.Label><Form.Control required minLength={3} value={name} onChange={e=>setName(e.target.value)} autoComplete="username"/></Form.Group>
 <Form.Group className="mb-3"><Form.Label>Пароль</Form.Label><Form.Control required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={register?'new-password':'current-password'}/></Form.Group>
 <Button variant="info" type="submit" disabled={busy}>{busy?<Spinner size="sm"/>:register?'Регистрация и вход':'Войти'}</Button>
 <Button variant="link" className="recovery-auth-link" disabled={busy} onClick={()=>setRegister(v=>!v)}>{register?'Уже есть аккаунт? Вход':'Нет аккаунта? Регистрация'}</Button></Form>}
 </main>
}
