import { useState, type FormEvent } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useRecoveryStrategiesDispatch, useRecoveryStrategiesSelector } from '../store/recovery_strategies_hooks';
import { recoveryStrategiesAuthActions, recoveryStrategiesUiActions, recoveryStrategiesLoad } from '../store/recovery_strategies_store';
import { recoveryStrategiesAuthHttp, errorText } from '../api/recovery_strategies_http';

export function LoginPage() {
    const dispatch = useRecoveryStrategiesDispatch();
    const { busy, error } = useRecoveryStrategiesSelector(state => state.recoveryStrategiesAuth);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [register, setRegister] = useState(false);

    async function login(event: FormEvent) {
        event.preventDefault();
        if (busy) return;
        dispatch(recoveryStrategiesAuthActions.loginStart());
        try {
            const credentials = { username: name.trim(), password };
            if (register) {
                await recoveryStrategiesAuthHttp.post('/users/register', credentials);
                // If login fails after registration, retry login rather than register again.
                setRegister(false);
            }
            const { data } = await recoveryStrategiesAuthHttp.post<{
                username: string;
                user_id: number;
            }>('/users/login', credentials);
            dispatch(recoveryStrategiesAuthActions.loginSuccess(data));
            setPassword('');
            dispatch(recoveryStrategiesUiActions.navigate('catalog'));
            void dispatch(recoveryStrategiesLoad());
        } catch (error) {
            dispatch(recoveryStrategiesAuthActions.loginFailure(errorText(error)));
        }
    }

    return (
        <main className="page-content container auth-page">
            <h1 className="page-heading">{register ? 'Регистрация' : 'Вход в систему'}</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form className="filter-panel" onSubmit={event => void login(event)}>
                <fieldset disabled={busy}>
                    <Form.Group className="mb-3" controlId="login-username">
                        <Form.Label>Имя пользователя</Form.Label>
                        <Form.Control required minLength={3} maxLength={100} value={name} onChange={event => setName(event.target.value)} autoComplete="username" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="login-password">
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control required minLength={6} type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={register ? 'new-password' : 'current-password'} />
                    </Form.Group>
                    <Button variant="info" type="submit" disabled={busy}>
                        {busy ? <Spinner size="sm" /> : register ? 'Регистрация и вход' : 'Войти'}
                    </Button>
                    <Button type="button" variant="link" className="recovery-auth-link" disabled={busy} onClick={() => setRegister(value => !value)}>
                        {register ? 'Уже есть аккаунт? Вход' : 'Нет аккаунта? Регистрация'}
                    </Button>
                </fieldset>
            </Form>
        </main>
    );
}
