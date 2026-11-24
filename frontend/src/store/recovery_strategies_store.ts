import { MOCK_ONLY } from '../recovery_strategies_environment';
import { configureStore, createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { mockStrategies } from '../data/recovery_strategies_mock_data';
import type { Strategy, FilterValues, Page } from '../recovery_strategies_types';
import { RecoveryStrategiesSwaggerClient } from '../api/generated/recovery_strategies_swagger_client';
import { recoveryStrategiesHttp, errorText } from '../api/recovery_strategies_http';

export const recoveryStrategiesClient = new RecoveryStrategiesSwaggerClient(recoveryStrategiesHttp);
export const recoveryStrategiesInitialFilter: FilterValues = { search: '', minTime: '', maxTime: '' };

type AuthState = {
    username: string | null;
    userId: number | null;
    authenticated: boolean;
    busy: boolean;
    error: string | null;
};

// F5 intentionally resets Redux to guest; the HttpOnly session cookie remains.
const initialAuth: AuthState = {
    username: null,
    userId: null,
    authenticated: false,
    busy: false,
    error: null,
};

const recoveryStrategiesAuthSlice = createSlice({
    name: 'recoveryStrategiesAuth',
    initialState: initialAuth,
    reducers: {
        loginStart(state) {
            state.busy = true;
            state.error = null;
        },
        loginSuccess(state, action: PayloadAction<{ username: string; user_id: number }>) {
            state.busy = false;
            state.authenticated = true;
            state.username = action.payload.username;
            state.userId = action.payload.user_id;
        },
        loginFailure(state, action: PayloadAction<string>) {
            state.busy = false;
            state.error = action.payload;
        },
        logoutSuccess: () => ({ ...initialAuth }),
    },
});
export const recoveryStrategiesAuthActions = recoveryStrategiesAuthSlice.actions;

const recoveryStrategiesFilterSlice = createSlice({
    name: 'recoveryStrategiesFilters',
    initialState: { ...recoveryStrategiesInitialFilter },
    reducers: {
        setFilters: (_state, action: PayloadAction<FilterValues>) => action.payload,
        resetFilters: () => ({ ...recoveryStrategiesInitialFilter }),
    },
});
export const recoveryStrategiesFilterActions = recoveryStrategiesFilterSlice.actions;

const recoveryStrategiesUiSlice = createSlice({
    name: 'recoveryStrategiesUI',
    initialState: { page: 'feed' as Page, selectedId: null as number | null, feedIndex: 0 },
    reducers: {
        navigate(state, action: PayloadAction<Page>) {
            state.page = action.payload;
            state.selectedId = null;
        },
        openStrategy(state, action: PayloadAction<number>) {
            state.page = 'detail';
            state.selectedId = action.payload;
        },
        setFeedIndex(state, action: PayloadAction<number>) {
            state.feedIndex = action.payload;
        },
        clearSelection(state) {
            state.selectedId = null;
        },
    },
    extraReducers: builder => {
        builder.addCase(recoveryStrategiesAuthActions.logoutSuccess, state => {
            state.feedIndex = 0;
            state.selectedId = null;
        });
    },
});
export const recoveryStrategiesUiActions = recoveryStrategiesUiSlice.actions;

type DataState = {
    items: Strategy[];
    source: 'mock' | 'backend';
    loading: boolean;
    busy: boolean;
    error: string | null;
    draft: Strategy | null;
    appliedFilters: FilterValues;
    activeLoadId: string | null;
};
const initialData: DataState = {
    items: mockStrategies,
    source: 'mock',
    loading: false,
    busy: false,
    error: null,
    draft: null,
    appliedFilters: { ...recoveryStrategiesInitialFilter },
    activeLoadId: null,
};

function filterMock(filters: FilterValues): Strategy[] {
    const search = filters.search.trim().toLowerCase();
    return mockStrategies.filter(item => {
        const time = item.estimated_time;
        return item.title.toLowerCase().includes(search)
            && (filters.minTime === '' || (time !== null && time >= Number(filters.minTime)))
            && (filters.maxTime === '' || (time !== null && time <= Number(filters.maxTime)));
    });
}

export const recoveryStrategiesLoad = createAsyncThunk(
    'recoveryStrategies/load',
    async (requested: FilterValues | void, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const filters = requested || state.recoveryStrategiesFilters;
        if (MOCK_ONLY) {
            return { items: filterMock(filters), source: 'mock' as const, filters };
        }
        const params = {
            search: filters.search.trim() || undefined,
            min_time: filters.minTime === '' ? undefined : Number(filters.minTime),
            max_time: filters.maxTime === '' ? undefined : Number(filters.maxTime),
        };
        try {
            const items = await recoveryStrategiesClient.recoveryStrategiesList(
                params, state.recoveryStrategiesAuth.authenticated ? 12000 : 3000,
            );
            // Cookie can remain after F5; Redux guest must not show user-only controls.
            return {
                items: state.recoveryStrategiesAuth.authenticated
                    ? items
                    : items.map(item => ({ ...item, is_creator: 0, is_liked: 0 })),
                source: 'backend' as const,
                filters,
            };
        } catch (error) {
            if (!state.recoveryStrategiesAuth.authenticated
                && axios.isAxiosError(error)
                && (!error.response || error.response.status >= 500)) {
                return { items: filterMock(filters), source: 'mock' as const, filters };
            }
            return rejectWithValue(errorText(error));
        }
    },
);

export const recoveryStrategiesGetDraft = createAsyncThunk(
    'recoveryStrategies/getDraft',
    async (_: void, { rejectWithValue }) => {
        try {
            return await recoveryStrategiesClient.recoveryStrategiesGetDraft();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) return null;
            return rejectWithValue(errorText(error));
        }
    },
);

type CreateArgs = {
    title: string;
    image: File | null;
    video: File | null;
    estimated_time: number;
    cost: number;
    short_description: string;
};

export const recoveryStrategiesCreate = createAsyncThunk(
    'recoveryStrategies/create',
    async (args: CreateArgs, { rejectWithValue }) => {
        try {
            const form = new FormData();
            form.append('title', args.title.trim());
            if (args.image) form.append('image', args.image);
            if (args.video) form.append('video', args.video);

            // A failed publication may have left a draft. Reuse it safely on retry.
            let draft: Strategy | null = null;
            try {
                draft = await recoveryStrategiesClient.recoveryStrategiesGetDraft();
            } catch (error) {
                if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
            }
            if (draft) {
                await recoveryStrategiesClient.recoveryStrategiesUpdateDraft(form);
            } else {
                await recoveryStrategiesClient.recoveryStrategiesCreateDraft(form);
            }
            return await recoveryStrategiesClient.recoveryStrategiesPublishDraft({
                estimated_time: args.estimated_time,
                cost: args.cost,
                short_description: args.short_description,
            });
        } catch (error) {
            return rejectWithValue(errorText(error));
        }
    },
);

export const recoveryStrategiesDelete = createAsyncThunk(
    'recoveryStrategies/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await recoveryStrategiesClient.recoveryStrategiesDelete(id);
            return id;
        } catch (error) {
            return rejectWithValue(errorText(error));
        }
    },
);

export const recoveryStrategiesLike = createAsyncThunk(
    'recoveryStrategies/like',
    async ({ id, liked }: { id: number; liked: 0 | 1 }, { rejectWithValue }) => {
        try {
            const result = await recoveryStrategiesClient.recoveryStrategiesSetLike(id, { liked });
            return { id, ...result };
        } catch (error) {
            return rejectWithValue(errorText(error));
        }
    },
);

const recoveryStrategiesDataSlice = createSlice({
    name: 'recoveryStrategiesData',
    initialState: initialData,
    reducers: {
        clearError(state) { state.error = null; },
    },
    extraReducers: builder => {
        builder
            .addCase(recoveryStrategiesLoad.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                state.activeLoadId = action.meta.requestId;
            })
            .addCase(recoveryStrategiesLoad.fulfilled, (state, action) => {
                if (state.activeLoadId !== action.meta.requestId) return;
                state.loading = false;
                state.activeLoadId = null;
                state.items = action.payload.items;
                state.source = action.payload.source;
                state.appliedFilters = action.payload.filters;
            })
            .addCase(recoveryStrategiesLoad.rejected, (state, action) => {
                if (state.activeLoadId !== action.meta.requestId) return;
                state.loading = false;
                state.activeLoadId = null;
                state.error = String(action.payload || action.error.message);
            })
            .addCase(recoveryStrategiesGetDraft.pending, state => {
                state.busy = true;
                state.error = null;
                state.draft = null;
            })
            .addCase(recoveryStrategiesGetDraft.fulfilled, (state, action) => {
                state.busy = false;
                state.draft = action.payload;
            })
            .addCase(recoveryStrategiesGetDraft.rejected, (state, action) => {
                state.busy = false;
                state.error = String(action.payload || action.error.message);
            })
            .addCase(recoveryStrategiesCreate.pending, state => {
                state.busy = true;
                state.error = null;
            })
            .addCase(recoveryStrategiesCreate.fulfilled, (state, action) => {
                state.busy = false;
                state.draft = null;
                state.source = 'backend';
            })
            .addCase(recoveryStrategiesCreate.rejected, (state, action) => {
                state.busy = false;
                state.error = String(action.payload || action.error.message);
            })
            .addCase(recoveryStrategiesDelete.pending, state => {
                state.busy = true;
                state.error = null;
            })
            .addCase(recoveryStrategiesDelete.fulfilled, (state, action) => {
                state.busy = false;
                state.items = state.items.filter(item => item.id !== action.payload);
            })
            .addCase(recoveryStrategiesDelete.rejected, (state, action) => {
                state.busy = false;
                state.error = String(action.payload || action.error.message);
            })
            .addCase(recoveryStrategiesLike.pending, state => {
                state.busy = true;
                state.error = null;
            })
            .addCase(recoveryStrategiesLike.fulfilled, (state, action) => {
                state.busy = false;
                const item = state.items.find(item => item.id === action.payload.id);
                if (item) {
                    item.is_liked = action.payload.liked;
                    item.likes_count = action.payload.likes_count;
                }
            })
            .addCase(recoveryStrategiesLike.rejected, (state, action) => {
                state.busy = false;
                state.error = String(action.payload || action.error.message);
            })
            .addCase(recoveryStrategiesAuthActions.loginSuccess, state => {
                // Never keep offline mock cards in the authenticated interface.
                if (state.source === 'mock') {
                    state.items = [];
                    state.source = 'backend';
                }
            })
            .addCase(recoveryStrategiesAuthActions.logoutSuccess, state => {
                state.draft = null;
                state.items = mockStrategies;
                state.source = 'mock';
                state.error = null;
                state.appliedFilters = { ...recoveryStrategiesInitialFilter };
            });
    },
});
export const recoveryStrategiesDataActions = recoveryStrategiesDataSlice.actions;

export const recoveryStrategiesStore = configureStore({
    reducer: {
        recoveryStrategiesAuth: recoveryStrategiesAuthSlice.reducer,
        recoveryStrategiesFilters: recoveryStrategiesFilterSlice.reducer,
        recoveryStrategiesUI: recoveryStrategiesUiSlice.reducer,
        recoveryStrategiesData: recoveryStrategiesDataSlice.reducer,
    },
});
export type RootState = ReturnType<typeof recoveryStrategiesStore.getState>;
export type AppDispatch = typeof recoveryStrategiesStore.dispatch;
