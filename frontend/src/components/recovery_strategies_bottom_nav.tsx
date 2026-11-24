import {Nav} from 'react-bootstrap';
import type {Page} from '../recovery_strategies_types';
export function BottomNav({page,onNavigate,authenticated,disabled,onLogout}:{page:Page;onNavigate:(page:Page)=>void;authenticated:boolean;disabled:boolean;onLogout:()=>void}){
 return <Nav className="bottom-nav" justify variant="pills" aria-label="Меню">
  <Nav.Item><Nav.Link active={page==='feed'} disabled={disabled} onClick={()=>onNavigate('feed')}><span className="nav-icon">▣</span><span>Лента</span></Nav.Link></Nav.Item>
  <Nav.Item><Nav.Link active={page==='create'} disabled={!authenticated||disabled} onClick={()=>onNavigate('create')}><span className="nav-icon">✚</span><span>Добавление</span></Nav.Link></Nav.Item>
  <Nav.Item><Nav.Link active={page==='catalog'} disabled={disabled} onClick={()=>onNavigate('catalog')}><span className="nav-icon">▦</span><span>Плитка</span></Nav.Link></Nav.Item>
  <Nav.Item><Nav.Link active={page==='login'} disabled={disabled} onClick={()=>authenticated?onLogout():onNavigate('login')}><span className="nav-icon">♙</span><span>{authenticated?'Выход':'Вход'}</span></Nav.Link></Nav.Item>
 </Nav>;
}
