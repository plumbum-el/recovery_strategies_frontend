"""Generate the topic-specific Axios client from FastAPI OpenAPI.

Run with the backend running: python scripts/recovery_strategies_generate_client.py
An exported OpenAPI file can also be supplied as the first argument.
"""
import json
import sys
from pathlib import Path
from urllib.request import urlopen

if len(sys.argv) > 1:
    openapi = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
else:
    with urlopen("http://127.0.0.1:8000/openapi.json", timeout=15) as response:
        openapi = json.load(response)

paths = openapi["paths"]
# Domain operations only. Authorization is deliberately handled by direct Axios.
operations = [
    (
        "get", "/api/recovery_strategies", "recoveryStrategiesList",
        "params: RecoveryStrategiesSearchParams = {}, timeout = 12000",
        "Strategy[]", "'/recovery_strategies', { params, timeout }",
    ),
    (
        "get", "/api/recovery_strategies/feed", "recoveryStrategiesFeed",
        "id?: number, next = false", "Strategy",
        "'/recovery_strategies/feed', { params: { id, next } }",
    ),
    (
        "post", "/api/recovery_strategies", "recoveryStrategiesCreateDraft",
        "form: FormData", "Strategy", "'/recovery_strategies', form, { timeout: 120000 }",
    ),
    (
        "put", "/api/recovery_strategies/draft", "recoveryStrategiesUpdateDraft",
        "form: FormData", "Strategy", "'/recovery_strategies/draft', form, { timeout: 120000 }",
    ),
    (
        "put", "/api/recovery_strategies/draft/publish", "recoveryStrategiesPublishDraft",
        "body: RecoveryStrategiesPublishRequest", "Strategy", "'/recovery_strategies/draft/publish', body",
    ),
    (
        "get", "/api/recovery_strategies/draft", "recoveryStrategiesGetDraft",
        "", "Strategy", "'/recovery_strategies/draft'",
    ),
    (
        "delete", "/api/recovery_strategies/{strategy_id}", "recoveryStrategiesDelete",
        "id: number", "{ id: number; status: string }", "`/recovery_strategies/${id}`",
    ),
    (
        "post", "/api/recovery_strategies/{strategy_id}/like", "recoveryStrategiesSetLike",
        "id: number, body: RecoveryStrategiesLikeRequest", "{ liked: number; likes_count: number }",
        "`/recovery_strategies/${id}/like`, body",
    ),
]

header = """/** Generated from FastAPI /openapi.json. Do not edit manually. */
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
"""
lines = [header]
for method, path, name, parameters, result, arguments in operations:
    operation = paths.get(path, {}).get(method)
    if operation is None:
        raise SystemExit(f"Missing OpenAPI operation: {method.upper()} {path}")
    lines.append(f"\n    /** {method.upper()} {path}; operationId: {operation['operationId']} */\n")
    lines.append(f"    async {name}({parameters}): Promise<{result}> {{\n")
    lines.append(f"        const {{ data }} = await this.http.{method}<{result}>({arguments});\n")
    lines.append("        return data;\n    }\n")
lines.append("}\n")

out = Path(__file__).resolve().parents[1] / "src/api/generated/recovery_strategies_swagger_client.ts"
out.write_text("".join(lines), encoding="utf-8")
print("Generated:", out)
