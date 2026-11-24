import {Button, Form} from 'react-bootstrap';
import type {FilterValues} from '../recovery_strategies_types';
const SLIDER_MIN=0;
const SLIDER_MAX=1440;
export function StrategyFilter({values,onChange,onApply,onReset}:{
 values:FilterValues;
 onChange:(value:FilterValues)=>void;
 onApply:()=>void;
 onReset:()=>void;
}) {
 const left=Math.min(SLIDER_MAX,Math.max(SLIDER_MIN,Number(values.minTime||SLIDER_MIN)));
 const right=Math.min(SLIDER_MAX,Math.max(left,Number(values.maxTime||SLIDER_MAX)));
 const setLeft=(value:number)=>onChange({...values,minTime:String(Math.min(value,right))});
 const setRight=(value:number)=>onChange({...values,maxTime:String(Math.max(value,left))});
 return <Form className="filter-panel" onSubmit={e=>{e.preventDefault();onApply()}}>
  <Form.Group className="mb-3"><Form.Label>Поиск стратегии</Form.Label>
  <Form.Control placeholder="Введите название стратегии" value={values.search}
   onChange={e=>onChange({...values,search:e.target.value})}/></Form.Group>
  <div className="filter-range-title">Время восстановления</div>
  <div className="filter-range-subtitle">Выберите диапазон времени, мин</div>
  <div className="filter-values">
   <label className="filter-value-box"><span>от</span><input type="number" min={SLIDER_MIN} max={right}
    aria-label="Время от, минут" value={left} onChange={e=>setLeft(Number(e.target.value))}/></label>
   <label className="filter-value-box"><span>до</span><input type="number" min={left} max={SLIDER_MAX}
    aria-label="Время до, минут" value={right} onChange={e=>setRight(Number(e.target.value))}/></label>
  </div>
  <div className="range-selector" aria-label="Диапазон времени восстановления">
   <div className="range-track"/>
   <div className="range-highlight" style={{left:`${100*left/SLIDER_MAX}%`,right:`${100*(SLIDER_MAX-right)/SLIDER_MAX}%`}}/>
   <input className="range-left" type="range" min={SLIDER_MIN} max={SLIDER_MAX} value={left}
    aria-label="Минимальное время" onChange={e=>setLeft(Number(e.target.value))}/>
   <input className="range-right" type="range" min={SLIDER_MIN} max={SLIDER_MAX} value={right}
    aria-label="Максимальное время" onChange={e=>setRight(Number(e.target.value))}/>
  </div>
  <div className="range-ends"><span>{left} мин</span><span>{right} мин</span></div>
  <div className="filter-buttons"><Button type="submit" variant="info">Применить</Button>
  <Button type="button" variant="link" onClick={onReset}>Сбросить</Button></div>
 </Form>;
}
