import {useState} from 'react';
import {Alert,Button,Form,Spinner} from 'react-bootstrap';
import {useRecoveryStrategiesDispatch,useRecoveryStrategiesSelector} from '../store/recovery_strategies_hooks';
import {recoveryStrategiesCreate,recoveryStrategiesLoad,recoveryStrategiesUiActions} from '../store/recovery_strategies_store';
export function CreatePage(){
 const dispatch=useRecoveryStrategiesDispatch(); const authenticated=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesAuth.authenticated);
 const {busy,error}=useRecoveryStrategiesSelector(s=>s.recoveryStrategiesData);
 const [title,setTitle]=useState('');const [description,setDescription]=useState('');const [time,setTime]=useState('30');const [cost,setCost]=useState('0');
 const [image,setImage]=useState<File|null>(null);const [video,setVideo]=useState<File|null>(null);
 const [imagePreview,setImagePreview]=useState<string|null>(null);
 if(!authenticated)return <main className="page-content container"><Alert variant="warning">Для добавления стратегии нужно войти.</Alert></main>;
 async function submit(e:React.FormEvent){e.preventDefault();if(!image||!video)return;
 const result=await dispatch(recoveryStrategiesCreate({title,image,video,estimated_time:Number(time),cost:Number(cost),short_description:description}));
 if(recoveryStrategiesCreate.fulfilled.match(result)){dispatch(recoveryStrategiesUiActions.navigate('catalog'));void dispatch(recoveryStrategiesLoad())}
 }
 return <main className="page-content container auth-page"><h1 className="page-heading">Добавление стратегии</h1>

 {error&&<Alert variant="danger">{error}</Alert>}
 <Form className="filter-panel" onSubmit={e=>void submit(e)}>
 <Form.Group className="mb-3"><Form.Label>Название стратегии</Form.Label><Form.Control required maxLength={150} value={title} onChange={e=>setTitle(e.target.value)}/></Form.Group>
 <Form.Group className="mb-3"><Form.Label>Описание</Form.Label><Form.Control as="textarea" rows={3} value={description} onChange={e=>setDescription(e.target.value)}/></Form.Group>
 <Form.Group className="mb-3"><Form.Label>Время восстановления (мин)</Form.Label><Form.Control required type="number" min="0" value={time} onChange={e=>setTime(e.target.value)}/></Form.Group>
 <Form.Group className="mb-3"><Form.Label>Стоимость обслуживания (₽)</Form.Label><Form.Control required type="number" min="0" value={cost} onChange={e=>setCost(e.target.value)}/></Form.Group>
 <Form.Group className="mb-3"><Form.Label>Изображение</Form.Label><Form.Control required type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=(e.target as HTMLInputElement).files?.[0]??null;setImage(file);if(imagePreview)URL.revokeObjectURL(imagePreview);setImagePreview(file?URL.createObjectURL(file):null)}}/>
 {imagePreview&&<img className="upload-preview mt-2" src={imagePreview} alt="Предпросмотр выбранного изображения"/>}</Form.Group>
 <Form.Group className="mb-3"><Form.Label>Видео</Form.Label><Form.Control required type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e=>setVideo((e.target as HTMLInputElement).files?.[0]??null)}/></Form.Group>
 <Button variant="info" type="submit" disabled={busy||!image||!video||!title.trim()}>{busy?<><Spinner size="sm"/> Публикация...</>:'Опубликовать стратегию'}</Button>
 </Form></main>
}
