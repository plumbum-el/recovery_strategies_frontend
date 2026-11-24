/**
 * Generated-style typed Axios client for the actual OpenAPI operations of ЛР4.
 * Re-generate from the live /openapi.json with scripts/recovery_strategies_generate_client.py.
 * Only domain (strategy) operations are here: auth is intentionally handled manually.
 */
import type { AxiosInstance } from 'axios';
import type { Strategy } from '../../recovery_strategies_types';
export type RecoveryStrategiesSearchParams={search?:string;min_time?:number;max_time?:number};
export type RecoveryStrategiesPublishRequest={estimated_time:number;cost:number;short_description?:string};
export type RecoveryStrategiesLikeRequest={liked:0|1};
export class RecoveryStrategiesSwaggerClient {
 constructor(private readonly http:AxiosInstance){}
 async recoveryStrategiesList(params:RecoveryStrategiesSearchParams={}):Promise<Strategy[]> {
  const {data}=await this.http.get<Strategy[]>('/recovery_strategies',{params});return data;
 }
 async recoveryStrategiesFeed(id?:number,next=false):Promise<Strategy>{
  const {data}=await this.http.get<Strategy>('/recovery_strategies/feed',{params:{id,next}});return data;
 }
 async recoveryStrategiesCreateDraft(form:FormData):Promise<Strategy>{
  const {data}=await this.http.post<Strategy>('/recovery_strategies',form);return data;
 }
 async recoveryStrategiesPublishDraft(body:RecoveryStrategiesPublishRequest):Promise<Strategy>{
  const {data}=await this.http.put<Strategy>('/recovery_strategies/draft/publish',body);return data;
 }
 async recoveryStrategiesGetDraft():Promise<Strategy>{
  const {data}=await this.http.get<Strategy>('/recovery_strategies/draft');return data;
 }
 async recoveryStrategiesDelete(id:number):Promise<{id:number;status:string}>{
  const {data}=await this.http.delete(`/recovery_strategies/${id}`);return data;
 }
 async recoveryStrategiesSetLike(id:number,body:RecoveryStrategiesLikeRequest):Promise<{liked:number;likes_count:number}>{
  const {data}=await this.http.post(`/recovery_strategies/${id}/like`,body);return data;
 }
}
