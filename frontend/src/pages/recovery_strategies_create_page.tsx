import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { mediaUrl } from '../api/recovery_strategies_http';
import { DEFAULT_IMAGE } from '../components/recovery_strategies_media';
import { useRecoveryStrategiesDispatch, useRecoveryStrategiesSelector } from '../store/recovery_strategies_hooks';
import {
    recoveryStrategiesCreate,
    recoveryStrategiesGetDraft,
    recoveryStrategiesLoad,
    recoveryStrategiesFilterActions,
    recoveryStrategiesUiActions,
} from '../store/recovery_strategies_store';

function usePreview(file: File | null) {
    const [preview, setPreview] = useState<string | null>(null);
    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);
    return preview;
}

export function CreatePage() {
    const dispatch = useRecoveryStrategiesDispatch();
    const authenticated = useRecoveryStrategiesSelector(s => s.recoveryStrategiesAuth.authenticated);
    const { busy, loading, draft } = useRecoveryStrategiesSelector(s => s.recoveryStrategiesData);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [time, setTime] = useState('30');
    const [cost, setCost] = useState('0');
    const [image, setImage] = useState<File | null>(null);
    const [video, setVideo] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');
    const [ready, setReady] = useState(false);
    const imageInput = useRef<HTMLInputElement>(null);
    const videoInput = useRef<HTMLInputElement>(null);
    const imagePreview = usePreview(image);
    const videoPreview = usePreview(video);
    const blocked = busy || loading || !ready;

    useEffect(() => {
        if (!authenticated) return;
        let active = true;
        void dispatch(recoveryStrategiesGetDraft()).then(result => {
            if (!active) return;
            if (recoveryStrategiesGetDraft.fulfilled.match(result)) {
                const existing = result.payload;
                if (existing) {
                    setTitle(existing.title);
                    setDescription(existing.short_description || '');
                    setTime(String(existing.estimated_time ?? 30));
                    setCost(String(existing.cost ?? 0));
                }
                setReady(true);
            }
        });
        return () => { active = false; };
    }, [authenticated, dispatch]);

    function selectFile(file: File | undefined, kind: 'image' | 'video') {
        if (!file) return;
        const allowed = kind === 'image' ? /\.(jpe?g|png|webp)$/i : /\.(mp4|webm|mov)$/i;
        if (!allowed.test(file.name) || !file.type.startsWith(`${kind}/`) || !file.size || file.size > 100 * 1024 * 1024) {
            setFileError('Выберите файл допустимого формата размером до 100 МБ.');
            return;
        }
        setFileError('');
        if (kind === 'image') setImage(file);
        else setVideo(file);
    }

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (blocked || !title.trim() || !(image || draft?.image_url) || !(video || draft?.video_url)) return;
        const result = await dispatch(recoveryStrategiesCreate({
            title, image, video,
            estimated_time: Number(time),
            cost: Number(cost),
            short_description: description,
        }));
        if (recoveryStrategiesCreate.fulfilled.match(result)) {
            dispatch(recoveryStrategiesFilterActions.resetFilters());
            dispatch(recoveryStrategiesUiActions.navigate('catalog'));
            void dispatch(recoveryStrategiesLoad());
        }
    }

    if (!authenticated) {
        return <main className="page-content container"><Alert variant="warning">Для добавления стратегии нужно войти.</Alert></main>;
    }

    return (
        <main className="page-content container auth-page">
            <h1 className="page-heading">Добавление стратегии</h1>
            {draft && <Alert variant="info">Найден черновик. Можно заменить изображение или видео.</Alert>}
            {fileError && <Alert variant="danger">{fileError}</Alert>}
            {!ready && !busy && <Button variant="info" onClick={() => {
                void dispatch(recoveryStrategiesGetDraft()).then(result => {
                    if (recoveryStrategiesGetDraft.fulfilled.match(result)) {
                        setTitle(result.payload?.title || '');
                        setReady(true);
                    }
                });
            }}>Повторить загрузку черновика</Button>}
            <Form className="filter-panel" onSubmit={event => void submit(event)}>
                <fieldset disabled={blocked}>
                    <Form.Group className="mb-3" controlId="strategy-title">
                        <Form.Label>Название стратегии</Form.Label>
                        <Form.Control required maxLength={150} value={title} onChange={event => setTitle(event.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="strategy-description">
                        <Form.Label>Описание</Form.Label>
                        <Form.Control as="textarea" rows={3} maxLength={500} value={description} onChange={event => setDescription(event.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="strategy-time">
                        <Form.Label>Время восстановления (мин)</Form.Label>
                        <Form.Control required type="number" min="0" max="2147483647" step="1" value={time} onChange={event => setTime(event.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="strategy-cost">
                        <Form.Label>Стоимость обслуживания (₽)</Form.Label>
                        <Form.Control required type="number" min="0" max="2147483647" step="1" value={cost} onChange={event => setCost(event.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="strategy-image">Изображение</Form.Label>
                        <img key={imagePreview || draft?.image_url || 'default'} className="upload-preview" src={imagePreview || mediaUrl(draft?.image_url) || DEFAULT_IMAGE} alt="Предпросмотр изображения" />
                        <input id="strategy-image" ref={imageInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
                            selectFile(event.currentTarget.files?.[0], 'image');
                            event.currentTarget.value = '';
                        }} />
                        <div className="upload-actions">
                            <Button type="button" variant="info" onClick={() => imageInput.current?.click()}>{image || draft?.image_url ? 'Изменить изображение' : 'Выбрать изображение'}</Button>
                            {image && <Button type="button" variant="link" onClick={() => setImage(null)}>Отменить замену</Button>}
                        </div>
                        <small className="upload-filename">{image?.name || (draft?.image_url ? 'Изображение черновика' : 'Файл не выбран')}</small>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="strategy-video">Видео</Form.Label>
                        {(videoPreview || draft?.video_url) && <video key={videoPreview || draft?.video_url} className="upload-preview" src={videoPreview || mediaUrl(draft?.video_url) || undefined} controls muted playsInline preload="metadata" />}
                        <input id="strategy-video" ref={videoInput} className="visually-hidden" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={event => {
                            selectFile(event.currentTarget.files?.[0], 'video');
                            event.currentTarget.value = '';
                        }} />
                        <div className="upload-actions">
                            <Button type="button" variant="info" onClick={() => videoInput.current?.click()}>{video || draft?.video_url ? 'Изменить видео' : 'Выбрать видео'}</Button>
                            {video && <Button type="button" variant="link" onClick={() => setVideo(null)}>Отменить замену</Button>}
                        </div>
                        <small className="upload-filename">{video?.name || (draft?.video_url ? 'Видео черновика' : 'Файл не выбран')}</small>
                    </Form.Group>
                    <Button variant="info" type="submit" disabled={blocked || !(image || draft?.image_url) || !(video || draft?.video_url) || !title.trim()}>
                        {busy ? <><Spinner size="sm" /> Публикация...</> : 'Опубликовать стратегию'}
                    </Button>
                </fieldset>
            </Form>
        </main>
    );
}
