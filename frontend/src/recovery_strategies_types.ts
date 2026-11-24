export type Strategy = {
 id:number; title:string; short_description:string|null; status:string;
 image_url:string|null; video_url:string|null;
 estimated_time:number|null; cost:number|null; likes_count:number;
 creator_id?:number; is_creator?:number; is_liked?:number;
};
export type FilterValues={search:string;minTime:string;maxTime:string};
export type Page='feed'|'catalog'|'create'|'login';
