"""Generate topic-named Axios methods from the running FastAPI Swagger /openapi.json.

Usage: python scripts/recovery_strategies_generate_client.py
Requires backend at http://127.0.0.1:8000; uses only Python stdlib.
"""
from pathlib import Path
from urllib.request import urlopen
import json

url = 'http://127.0.0.1:8000/openapi.json'
with urlopen(url, timeout=15) as res:
    openapi = json.load(res)
paths = openapi.get('paths', {})
expected = {
 ('get','/api/recovery_strategies'):('recoveryStrategiesList','params:RecoveryStrategiesSearchParams={}','','get<Strategy[]>',"'/recovery_strategies',{params}",'Strategy[]'),
 ('get','/api/recovery_strategies/feed'):('recoveryStrategiesFeed','id?:number,next=false','','get<Strategy>',"'/recovery_strategies/feed',{params:{id,next}}",'Strategy'),
 ('post','/api/recovery_strategies'):('recoveryStrategiesCreateDraft','form:FormData','','post<Strategy>',"'/recovery_strategies',form",'Strategy'),
 ('put','/api/recovery_strategies/draft/publish'):('recoveryStrategiesPublishDraft','body:RecoveryStrategiesPublishRequest','','put<Strategy>',"'/recovery_strategies/draft/publish',body",'Strategy'),
 ('get','/api/recovery_strategies/draft'):('recoveryStrategiesGetDraft','','','get<Strategy>',"'/recovery_strategies/draft'",'Strategy'),
 ('delete','/api/recovery_strategies/{strategy_id}'):('recoveryStrategiesDelete','id:number','','delete<{id:number;status:string}>','`/recovery_strategies/${id}`','{id:number;status:string}'),
 ('post','/api/recovery_strategies/{strategy_id}/like'):('recoveryStrategiesSetLike','id:number,body:RecoveryStrategiesLikeRequest','','post<{liked:number;likes_count:number}>','`/recovery_strategies/${id}/like`,body','{liked:number;likes_count:number}'),
}
missing=[f'{method.upper()} {path}' for (method,path) in expected if method not in paths.get(path,{})]
if missing:
    raise SystemExit('Swagger API differs from LAB4; missing paths: '+', '.join(missing))
header="""/** AUTO-GENERATED from running FastAPI /openapi.json; do not edit manually. */
import type {AxiosInstance} from 'axios';
import type {Strategy} from '../../recovery_strategies_types';
export type RecoveryStrategiesSearchParams={search?:string;min_time?:number;max_time?:number};
export type RecoveryStrategiesPublishRequest={estimated_time:number;cost:number;short_description?:string};
export type RecoveryStrategiesLikeRequest={liked:0|1};
export class RecoveryStrategiesSwaggerClient {
 constructor(private readonly http:AxiosInstance){}
"""
lines=[header]
for (method,path),(name,params,_,verb,arg,ret) in expected.items():
    lines.append(f' /** {method.upper()} {path} (OpenAPI operationId={paths[path][method].get("operationId", "")}) */\n')
    lines.append(f' async {name}({params}):Promise<{ret}> {{\n')
    lines.append(f'  const {{data}}=await this.http.{verb}({arg});return data;\n }}\n')
lines.append('}\n')
out=Path(__file__).resolve().parents[1]/'src/api/generated/recovery_strategies_swagger_client.ts'
out.write_text(''.join(lines),encoding='utf-8')
print('Generated:',out)
