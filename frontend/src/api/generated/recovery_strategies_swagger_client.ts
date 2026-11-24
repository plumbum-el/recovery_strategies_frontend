/** Generated from FastAPI /openapi.json. Do not edit manually. */
import type { AxiosInstance } from 'axios';
import type { Strategy } from '../../recovery_strategies_types';

export type RecoveryStrategiesSearchParams = {
    search?: string;
    min_time?: number;
    max_time?: number;
};
export type RecoveryStrategiesPublishRequest = {
    estimated_time: number;
    cost: number;
    short_description?: string;
};
export type RecoveryStrategiesLikeRequest = { liked: 0 | 1 };

export class RecoveryStrategiesSwaggerClient {
    constructor(private readonly http: AxiosInstance) {}

    /** GET /api/recovery_strategies; operationId: list_strategies_api_recovery_strategies_get */
    async recoveryStrategiesList(params: RecoveryStrategiesSearchParams = {}, timeout = 12000): Promise<Strategy[]> {
        const { data } = await this.http.get<Strategy[]>('/recovery_strategies', { params, timeout });
        return data;
    }

    /** GET /api/recovery_strategies/feed; operationId: get_feed_api_recovery_strategies_feed_get */
    async recoveryStrategiesFeed(id?: number, next = false): Promise<Strategy> {
        const { data } = await this.http.get<Strategy>('/recovery_strategies/feed', { params: { id, next } });
        return data;
    }

    /** POST /api/recovery_strategies; operationId: create_draft_api_recovery_strategies_post */
    async recoveryStrategiesCreateDraft(form: FormData): Promise<Strategy> {
        const { data } = await this.http.post<Strategy>('/recovery_strategies', form, { timeout: 120000 });
        return data;
    }

    /** PUT /api/recovery_strategies/draft; operationId: update_draft_api_recovery_strategies_draft_put */
    async recoveryStrategiesUpdateDraft(form: FormData): Promise<Strategy> {
        const { data } = await this.http.put<Strategy>('/recovery_strategies/draft', form, { timeout: 120000 });
        return data;
    }

    /** PUT /api/recovery_strategies/draft/publish; operationId: publish_draft_api_recovery_strategies_draft_publish_put */
    async recoveryStrategiesPublishDraft(body: RecoveryStrategiesPublishRequest): Promise<Strategy> {
        const { data } = await this.http.put<Strategy>('/recovery_strategies/draft/publish', body);
        return data;
    }

    /** GET /api/recovery_strategies/draft; operationId: get_draft_api_recovery_strategies_draft_get */
    async recoveryStrategiesGetDraft(): Promise<Strategy> {
        const { data } = await this.http.get<Strategy>('/recovery_strategies/draft');
        return data;
    }

    /** DELETE /api/recovery_strategies/{strategy_id}; operationId: delete_strategy_api_recovery_strategies__strategy_id__delete */
    async recoveryStrategiesDelete(id: number): Promise<{ id: number; status: string }> {
        const { data } = await this.http.delete<{ id: number; status: string }>(`/recovery_strategies/${id}`);
        return data;
    }

    /** POST /api/recovery_strategies/{strategy_id}/like; operationId: set_like_api_recovery_strategies__strategy_id__like_post */
    async recoveryStrategiesSetLike(id: number, body: RecoveryStrategiesLikeRequest): Promise<{ liked: number; likes_count: number }> {
        const { data } = await this.http.post<{ liked: number; likes_count: number }>(`/recovery_strategies/${id}/like`, body);
        return data;
    }
}
