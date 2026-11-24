import { useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { BottomNav } from './components/recovery_strategies_bottom_nav';
import { CatalogPage } from './pages/recovery_strategies_catalog_page';
import { MOCK_ONLY } from './recovery_strategies_environment';
import { DetailPage } from './pages/recovery_strategies_detail_page';
import { FeedPage } from './pages/recovery_strategies_feed_page';
import { LoginPage } from './pages/recovery_strategies_login_page';
import { CreatePage } from './pages/recovery_strategies_create_page';
import { recoveryStrategiesLoad, recoveryStrategiesDelete, recoveryStrategiesLike, recoveryStrategiesUiActions, recoveryStrategiesAuthActions, recoveryStrategiesFilterActions, recoveryStrategiesDataActions, recoveryStrategiesInitialFilter } from './store/recovery_strategies_store';
import { recoveryStrategiesAuthHttp, errorText } from './api/recovery_strategies_http';
import { useRecoveryStrategiesDispatch, useRecoveryStrategiesSelector } from './store/recovery_strategies_hooks';

export default function App() {
    const dispatch = useRecoveryStrategiesDispatch();
    const page = useRecoveryStrategiesSelector(state => state.recoveryStrategiesUI.page);
    const { authenticated, busy: authBusy, error: authError } = useRecoveryStrategiesSelector(state => state.recoveryStrategiesAuth);
    const { busy, loading, error } = useRecoveryStrategiesSelector(state => state.recoveryStrategiesData);
    const blocked = busy || loading || authBusy;

    useEffect(() => {
        void dispatch(recoveryStrategiesLoad());
    }, [dispatch]);

    async function deleteOne(id: number) {
        if (!blocked && window.confirm('Удалить свою стратегию?')) {
            await dispatch(recoveryStrategiesDelete(id));
        }
    }
    async function likeOne(id: number, liked: 0 | 1) {
        if (!blocked) await dispatch(recoveryStrategiesLike({ id, liked }));
    }
    async function logout() {
        if (blocked) return;
        dispatch(recoveryStrategiesAuthActions.loginStart());
        try {
            // Direct Axios, no generated client or Thunk for authentication.
            await recoveryStrategiesAuthHttp.post('/users/logout');
            dispatch(recoveryStrategiesAuthActions.logoutSuccess());
            dispatch(recoveryStrategiesFilterActions.resetFilters());
            dispatch(recoveryStrategiesUiActions.navigate('feed'));
            void dispatch(recoveryStrategiesLoad(recoveryStrategiesInitialFilter));
        } catch (error) {
            dispatch(recoveryStrategiesAuthActions.loginFailure(errorText(error)));
        }
    }

    return (
        <div className="app-shell">
            <header className="app-header"><span className="brand-mark">↻</span><span>Recovery <b>Strategies</b></span>{MOCK_ONLY && <span className="mode-label">mock · PWA</span>}</header>
            {error && <div className="container mt-2"><Alert variant="warning" dismissible onClose={() => dispatch(recoveryStrategiesDataActions.clearError())}>{error}</Alert></div>}
            {authError && page !== 'login' && <div className="container mt-2"><Alert variant="danger">{authError}</Alert></div>}
            {page === 'feed' && <FeedPage onLike={(id, liked) => void likeOne(id, liked)} />}
            {page === 'catalog' && <CatalogPage onOpen={id => dispatch(recoveryStrategiesUiActions.openStrategy(id))} onDelete={id => void deleteOne(id)} onLike={(id, liked) => void likeOne(id, liked)} />}
            {page === 'detail' && <DetailPage onLike={(id, liked) => void likeOne(id, liked)} />}
            {page === 'create' && !MOCK_ONLY && <CreatePage />}
            {page === 'login' && !MOCK_ONLY && <LoginPage />}
            {blocked && <div className="request-overlay" role="status" aria-live="polite"><Spinner animation="border" /><span>Выполняется запрос...</span></div>}
            <BottomNav page={page} authenticated={authenticated} disabled={blocked} onNavigate={next => dispatch(recoveryStrategiesUiActions.navigate(next))} onLogout={() => void logout()} />
        </div>
    );
}
