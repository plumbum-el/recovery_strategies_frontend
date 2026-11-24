import React from 'react';
import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import './recovery_strategies_styles.css';
import App from './recovery_strategies_app';
import {recoveryStrategiesStore} from './store/recovery_strategies_store';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Provider store={recoveryStrategiesStore}><App/></Provider></React.StrictMode>);
