import {configureStore,createAsyncThunk,createSlice,type PayloadAction} from '@reduxjs/toolkit';
import {mockStrategies} from '../data/recovery_strategies_mock_data';
import type {Strategy,FilterValues,Page} from '../recovery_strategies_types';
import {RecoveryStrategiesSwaggerClient} from '../api/generated/recovery_strategies_swagger_client';
import {recoveryStrategiesHttp,errorText} from '../api/recovery_strategies_http';

export const recoveryStrategiesClient=new RecoveryStrategiesSwaggerClient(recoveryStrategiesHttp);
export const recoveryStrategiesInitialFilter:FilterValues={search:'',minTime:'',maxTime:''};
type AuthState={username:string|null;userId:number|null;authenticated:boolean;busy:boolean;error:string|null};
// On F5 the store starts as guest by design. HttpOnly cookie is NOT cleared.
const initialAuth:AuthState={username:null,userId:null,authenticated:false,busy:false,error:null};
const recoveryStrategiesAuthSlice=createSlice({name:'recoveryStrategiesAuth',initialState:initialAuth,reducers:{
 loginStart:s=>{s.busy=true;s.error=null},
 loginSuccess:(s,a:PayloadAction<{username:string;user_id:number}>)=>{s.busy=false;s.authenticated=true;s.username=a.payload.username;s.userId=a.payload.user_id},
 loginFailure:(s,a:PayloadAction<string>)=>{s.busy=false;s.error=a.payload},
 logoutSuccess:()=>({...initialAuth})
}});
export const recoveryStrategiesAuthActions=recoveryStrategiesAuthSlice.actions;
const recoveryStrategiesFilterSlice=createSlice({name:'recoveryStrategiesFilters',initialState:{...recoveryStrategiesInitialFilter},reducers:{
 setFilters:(_s,a:PayloadAction<FilterValues>)=>a.payload,
 resetFilters:()=>({...recoveryStrategiesInitialFilter})
}});
export const recoveryStrategiesFilterActions=recoveryStrategiesFilterSlice.actions;
const recoveryStrategiesUiSlice=createSlice({name:'recoveryStrategiesUI',initialState:{page:'feed' as Page,selectedId:null as number|null,feedIndex:0},reducers:{
 navigate:(s,a:PayloadAction<Page>)=>{s.page=a.payload;s.selectedId=null},
 openStrategy:(s,a:PayloadAction<number>)=>{s.page='feed';s.selectedId=a.payload},
 setFeedIndex:(s,a:PayloadAction<number>)=>{s.feedIndex=a.payload},
 clearSelection:s=>{s.selectedId=null}
}});
export const recoveryStrategiesUiActions=recoveryStrategiesUiSlice.actions;
type DataState={items:Strategy[];source:'mock'|'backend';loading:boolean;busy:boolean;error:string|null};
const initialData:DataState={items:mockStrategies,source:'mock',loading:false,busy:false,error:null};

export const recoveryStrategiesLoad=createAsyncThunk('recoveryStrategies/load',async (requested:FilterValues|void,{getState,rejectWithValue})=>{
 const s=getState() as RootState;
 const p=requested || s.recoveryStrategiesFilters;
 const params={search:p.search||undefined,min_time:p.minTime===''?undefined:Number(p.minTime),max_time:p.maxTime===''?undefined:Number(p.maxTime)};
 try{return {items:await recoveryStrategiesClient.recoveryStrategiesList(params),source:'backend' as const};}
 catch(e){

  if(!s.recoveryStrategiesAuth.authenticated)return {items:mockStrategies,source:'mock' as const};
  return rejectWithValue(errorText(e));
 }
});
export const recoveryStrategiesCreate=createAsyncThunk('recoveryStrategies/create',async (args:{title:string;image:File;video:File;estimated_time:number;cost:number;short_description:string},{rejectWithValue})=>{
 try{
  const fd=new FormData();fd.append('title',args.title);fd.append('image',args.image);fd.append('video',args.video);
  await recoveryStrategiesClient.recoveryStrategiesCreateDraft(fd);
  return await recoveryStrategiesClient.recoveryStrategiesPublishDraft({estimated_time:args.estimated_time,cost:args.cost,short_description:args.short_description});
 }catch(e){return rejectWithValue(errorText(e))}
});
export const recoveryStrategiesDelete=createAsyncThunk('recoveryStrategies/delete',async (id:number,{rejectWithValue})=>{
 try{await recoveryStrategiesClient.recoveryStrategiesDelete(id);return id}catch(e){return rejectWithValue(errorText(e))}
});
export const recoveryStrategiesLike=createAsyncThunk('recoveryStrategies/like',async ({id,liked}:{id:number;liked:0|1},{rejectWithValue})=>{
 try{const result=await recoveryStrategiesClient.recoveryStrategiesSetLike(id,{liked});return {id,...result}}
 catch(e){return rejectWithValue(errorText(e))}
});
const recoveryStrategiesDataSlice=createSlice({name:'recoveryStrategiesData',initialState:initialData,reducers:{
 clearError:s=>{s.error=null}
},extraReducers:builder=>{
 builder.addCase(recoveryStrategiesLoad.pending,s=>{s.loading=true;s.error=null})
 .addCase(recoveryStrategiesLoad.fulfilled,(s,a)=>{s.loading=false;s.items=a.payload.items;s.source=a.payload.source})
 .addCase(recoveryStrategiesLoad.rejected,(s,a)=>{s.loading=false;s.error=String(a.payload||a.error.message)})
 .addCase(recoveryStrategiesCreate.pending,s=>{s.busy=true;s.error=null})
 .addCase(recoveryStrategiesCreate.fulfilled,(s,a)=>{s.busy=false;s.items.push(a.payload);s.source='backend'})
 .addCase(recoveryStrategiesCreate.rejected,(s,a)=>{s.busy=false;s.error=String(a.payload||a.error.message)})
 .addCase(recoveryStrategiesDelete.pending,s=>{s.busy=true;s.error=null})
 .addCase(recoveryStrategiesDelete.fulfilled,(s,a)=>{s.busy=false;s.items=s.items.filter(x=>x.id!==a.payload)})
 .addCase(recoveryStrategiesDelete.rejected,(s,a)=>{s.busy=false;s.error=String(a.payload||a.error.message)})
 .addCase(recoveryStrategiesLike.pending,s=>{s.busy=true;s.error=null})
 .addCase(recoveryStrategiesLike.fulfilled,(s,a)=>{s.busy=false;const x=s.items.find(x=>x.id===a.payload.id);if(x){x.is_liked=a.payload.liked;x.likes_count=a.payload.likes_count}})
 .addCase(recoveryStrategiesLike.rejected,(s,a)=>{s.busy=false;s.error=String(a.payload||a.error.message)})
 }});
export const recoveryStrategiesDataActions=recoveryStrategiesDataSlice.actions;

export const recoveryStrategiesStore=configureStore({reducer:{
 recoveryStrategiesAuth:recoveryStrategiesAuthSlice.reducer,
 recoveryStrategiesFilters:recoveryStrategiesFilterSlice.reducer,
 recoveryStrategiesUI:recoveryStrategiesUiSlice.reducer,
 recoveryStrategiesData:recoveryStrategiesDataSlice.reducer

}});
export type RootState=ReturnType<typeof recoveryStrategiesStore.getState>;
export type AppDispatch=typeof recoveryStrategiesStore.dispatch;
