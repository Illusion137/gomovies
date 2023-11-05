import { Country_gm, FiltersCountry_gm, FiltersGenre_gm, FiltersQuality_gm, FiltersReleased_gm, FiltersType_gm, Genre_gm } from "./enumsGM";

export interface HrefString {
    href : string, 
    str : string
};

export interface GoMovie_Display_Content{
    content_type : string | undefined | null;
    title : string | undefined | null;
    thumbnail_url : string | undefined | null;
    quality: string | undefined | null;
    href : string | undefined | null;
    left_data : string | undefined | null;
    right_data : string | undefined | null;
};

export interface GoMovieTab{
    title : string | undefined | null;
    gomovies : GoMovie_Display_Content[] | any[];
};

export interface GoMovieSearchPage {
    title : string | undefined | null;
    gomovies : GoMovie_Display_Content[] | any[];
    page : number | undefined | null;
    last_page : number  | undefined | null;
}; 

export interface GoMovieFilters {
    type? : FiltersType_gm,
    quality? : FiltersQuality_gm,
    released? : FiltersReleased_gm,
    genre? : FiltersGenre_gm[],
    country? : FiltersCountry_gm[],
};

export interface GoMovie {
    title : string,
    quality : string,
    href : string,
    trailer_url : string,
    critic_rating : string,
    stars_ten : number,
    voted : number,
    released : string,
    duation : string,
    genres : Genre_gm[],
    countries : Country_gm[],
    productions : HrefString[],
    cast : HrefString[],
    description : string,
    may_also_like : GoMovieSearchPage
};