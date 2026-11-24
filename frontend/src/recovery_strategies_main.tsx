import { MOCK_ONLY } from './recovery_strategies_environment';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import './recovery_strategies_styles.css';
import App from './recovery_strategies_app';
import { recoveryStrategiesStore } from './store/recovery_strategies_store';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={recoveryStrategiesStore}>
        <App />
    </Provider>,
);

// Only the public mock build is cached; never cache authenticated API responses.
if (MOCK_ONLY && import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
            .catch(error => console.error('Не удалось зарегистрировать PWA:', error));
    });
}
