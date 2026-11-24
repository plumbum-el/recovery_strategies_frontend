import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
export const DEFAULT_IMAGE = '/media/recovery_strategies_default_image.png';
export const DEFAULT_VIDEO = '/media/recovery_strategies_default_video.mp4';
// During a media outage keep the four demo strategies visually distinct.
// Real successful requests still load via /s3 and MinIO.
function localBackup(src:string|null, kind:'image'|'video'):string {
 if(!src) return kind==='image'?DEFAULT_IMAGE:DEFAULT_VIDEO;
 const basename=decodeURIComponent(src.split('/').pop()||'');
 if(/^(sync|async|cloud|cold)_(image\.(png|jpg|jpeg|webp)|video\.(mp4|webm))$/.test(basename))
  return '/media/recovery_strategies_'+basename;
 return kind==='image'?DEFAULT_IMAGE:DEFAULT_VIDEO;
}
export function StrategyImage({src,alt,className=''}:{src:string|null;alt:string;className?:string}) {
 const [failed,setFailed] = useState(false);
 useEffect(()=>setFailed(false),[src]);
 return <img className={className} src={!src||failed?localBackup(src,'image'):src} alt={alt} onError={()=>setFailed(true)}/>;
}
export function StrategyVideo({src,poster}:{src:string|null;poster:string|null}) {
 const [failed,setFailed] = useState(false);
 const [posterFailed,setPosterFailed] = useState(false);
 useEffect(()=>{setFailed(false);setPosterFailed(false)},[src,poster]);
 const actualSrc = !src||failed?localBackup(src,'video'):src;
 const onError=(_event:SyntheticEvent<HTMLVideoElement>)=>{if(!failed)setFailed(true)};
 return <video key={actualSrc} className="strategy-video" controls muted playsInline preload="metadata" poster={!poster||posterFailed?localBackup(poster,'image'):poster} onError={onError} onLoadedData={()=>setPosterFailed(false)}><source src={actualSrc} type="video/mp4"/></video>;
}
