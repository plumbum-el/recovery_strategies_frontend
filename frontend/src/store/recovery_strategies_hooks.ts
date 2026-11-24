import {useDispatch,useSelector} from 'react-redux';
import type {AppDispatch,RootState} from './recovery_strategies_store';
export const useRecoveryStrategiesDispatch=useDispatch.withTypes<AppDispatch>();
export const useRecoveryStrategiesSelector=useSelector.withTypes<RootState>();
