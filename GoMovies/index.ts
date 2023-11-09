import axios from "axios";
import { JSDOM } from 'jsdom';
import { GoMovie_Display_Content, GoMovieTab, GoMovieSearchPage, GoMovieFilters, GoMovieMovie, HrefString, GoMovieSourceData, GoMovieAjaxSource } from './GoMovie';
import { Country_gm, Genre_gm, Path_gm, MonoPath_gm } from './enumsGM';

const GOMOVIES_BASE_URL = "https://gomovies.sx/";
const GOMOVIES_BASE_AJAX_URL = "https://gomovies.sx/ajax/";
const GOMOVIES_DEFAULT_HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
};
const GOMOVIES_DEFAULT_AJAX_HEADERS = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest",
};

export async function gomovies_register(){}
export async function gomovies_login(){}
export async function gomovies_add_to_favorites(){}

function gomoveies_trim_start_slash(str : string) : string{
    if(str[0] == '/') return str.slice(1);
    return str;
}
function gomovies_flw_item_to_gomovie_display_content(content_html : Element) : GoMovie_Display_Content{
    let content_type_text = content_html.querySelector(".film-detail .float-right")?.innerHTML;
    let left_right_data = content_html.querySelectorAll(".fdi-item");
    return {
        "content_type":     content_type_text,
        "title":            content_html.querySelector(".film-name")?.firstElementChild?.innerHTML, 
        "thumbnail_url":    content_html.querySelectorAll(".film-poster-img")[0]?.getAttribute("data-src"), 
        "quality":          content_html.querySelector(".film-poster-quality")?.innerHTML,
        "href":             gomoveies_trim_start_slash(content_html.querySelector("a")?.href), 
        "left_data":        left_right_data[0]?.innerHTML,
        "right_data":       left_right_data[1]?.innerHTML
    }
}
function gomovies_flw_items_to_gomovies_display_contents(document : Document) : GoMovie_Display_Content[]{
    const flw_items = document.querySelectorAll(".flw-item");
    const display_contents : GoMovie_Display_Content[] = [];
    for(let i = 0; i < flw_items.length; i++)
        display_contents.push(gomovies_flw_item_to_gomovie_display_content(flw_items[i]));
    return display_contents;
}
function gomovies_page_html_to_gomovie_tabs(page_html : string) : GoMovieTab[] {
    const { window } = new JSDOM(page_html);
    const contents = window.document.querySelectorAll('.flw-item, section');
    
    const gomovies_tab_data : GoMovieTab[] = [];

    for(let i = 0, c = 0; i < contents.length; i++){
        let content_html = contents[i];
        let is_section_header = content_html?.className !== "flw-item";
        if(is_section_header){
            gomovies_tab_data.push(
                {
                    "title":content_html.querySelector(".cat-heading")?.innerHTML, 
                    "gomovies": []
                }
            );
            c++;
        } else { 
            gomovies_tab_data[c-1].gomovies.push( gomovies_flw_item_to_gomovie_display_content(content_html) );
        }
    }
    return gomovies_tab_data;
}
function gomovies_page_html_to_search_page_data(page_html : string, page = 1) : GoMovieSearchPage {
    const { window } = new JSDOM(page_html);
    const contents = window.document.querySelectorAll('.flw-item, section');
    const doc = window.document;
    const last_page_str = doc.querySelector('[title="Last"]')?.getAttribute("href").replace(/.+?page=/,"");
    const last_page = parseInt(last_page_str);

    const gomovies_search_page_data : GoMovieSearchPage = {
        "title": contents[0].querySelector(".cat-heading")?.innerHTML,
        "gomovies": [],
        "page": page, 
        "last_page": last_page
    };
    gomovies_search_page_data
    for(let i = 1; i < contents.length; i++){
        let content_html = contents[i];
        gomovies_search_page_data.gomovies.push( gomovies_flw_item_to_gomovie_display_content(content_html) );
    }
    return gomovies_search_page_data;
}
export async function gomovies_home_page() : Promise< GoMovieTab[] > {
    const main_page_html = (await axios.get("home", {"baseURL": GOMOVIES_BASE_URL, "headers": GOMOVIES_DEFAULT_HEADERS})).data; 
    return gomovies_page_html_to_gomovie_tabs(main_page_html);
}
export async function gomovies_search_autocomplete(search_query : string) : Promise<GoMovie_Display_Content[]> {
    search_query = search_query.trim().replaceAll(/[^a-zA-Z0-9 ,]/g,'').trim();
    if(search_query == '') return null;
    const search_autocomplete_ajax_html_data = (await axios.post("search", `keyword=${search_query.replaceAll(' ', '+')}`, {"baseURL": GOMOVIES_BASE_AJAX_URL,"headers": GOMOVIES_DEFAULT_AJAX_HEADERS,}) ).data;
    const { window } = new JSDOM(search_autocomplete_ajax_html_data);
    const contents = window.document.querySelectorAll('a');

    const gomovies_autocomplete_data : GoMovie_Display_Content[] = [];

    for(let i = 0; i < contents.length - 1; i++){
        const content_html = contents[i];
        let left_right_content_type_data = content_html.querySelectorAll(".film-infor span");
        gomovies_autocomplete_data.push({
            "content_type":     left_right_content_type_data[ left_right_content_type_data.length-1 ]?.innerHTML,
            "title":            content_html.querySelector(".film-name")?.innerHTML, 
            "thumbnail_url":    content_html.querySelector(".film-poster-img")?.getAttribute("src"), 
            "quality":          undefined,
            "href":             content_html?.href.slice(1), 
            "left_data":        left_right_content_type_data[0]?.innerHTML,
            "right_data":       left_right_content_type_data[1]?.innerHTML
        });
    }
    return gomovies_autocomplete_data;
}
async function gomovies_get_page(href : string, page = 0) : Promise< GoMovieSearchPage > {
    const search_page_html = (await axios.get(href, {"baseURL": GOMOVIES_BASE_URL, "headers": GOMOVIES_DEFAULT_HEADERS})).data; 
    return gomovies_page_html_to_search_page_data(search_page_html, page);
}
export async function gomovies_search_mono_path(mono_path : MonoPath_gm, page = 1) : Promise< GoMovieSearchPage > {
    return await gomovies_get_page(mono_path, page);
}
export async function gomovies_search_by_query(search_query : string, page = 1) : Promise< GoMovieSearchPage > {
    search_query = search_query.trim().replaceAll(/[^a-zA-Z0-9 ,]/g,'').trim();
    if(search_query == '') return null;
    return await gomovies_get_page(`search/${search_query.replaceAll(' ', '-')}`, page);
}
export async function gomovies_search_path(path : Path_gm, data : Genre_gm | Country_gm | string, page = 0) : Promise< GoMovieSearchPage > {
    return await gomovies_get_page(path + data, page);
}
function gomovies_filters_to_query_string(filters : GoMovieFilters, page = 1) : string {
    const has_filters = filters.type || filters.quality || filters.released || filters.genre || filters.country;
    if(!has_filters) return null;
    let query_string = "filter?";
    if(filters.type) query_string += filters.type;
    if(filters.quality) query_string += filters.quality;
    if(filters.released) query_string += filters.released;
    if(filters.genre){
        const genre_end = filters.genre.length - 1;
        query_string += "&genre=";
        for(let i = 0; i < genre_end; i++)
            query_string += filters.genre[i] + '-';
        query_string += filters.genre[genre_end];
    }
    if(filters.country){
        const country_end = filters.country.length - 1;
        query_string += "&country=";
        for(let i = 0; i < country_end; i++)
            query_string += filters.country[i] + '-';
        query_string += filters.country[country_end];
    }
    query_string = query_string.replace('&','');
    query_string += `&page=${page}`;
    return query_string;
}
export async function gomovies_search_filters(filters : GoMovieFilters, page = 1) : Promise< GoMovieSearchPage > {
    let query_string = gomovies_filters_to_query_string(filters, page);
    console.log(query_string)
    if(!query_string) return null;
    return await gomovies_get_page(query_string);
}
function gomovies_parse_watch_page_genres(row_line : Element) : string[] {
    let genres : string[] = [];
    const row_line_a_tags = row_line.querySelectorAll("a");
    for(let i = 0; i < row_line_a_tags.length; i++)
        genres.push(row_line_a_tags[i]?.href.replace("/genre/",""));
    return genres;
}
function gomovies_parse_watch_page_cast(row_line : Element) : HrefString[] {
    let cast : HrefString[] = [];
    const row_line_a_tags = row_line.querySelectorAll("a");
    for(let i = 0; i < row_line_a_tags.length; i++)
        cast.push({"str":row_line_a_tags[i]?.innerHTML,"href": row_line_a_tags[i]?.href.replace("/cast/","")});
    return cast;
}
function gomovies_parse_watch_page_countries(row_line : Element) : string[] { 
    let countries : string[] = [];
    const row_line_a_tags = row_line.querySelectorAll("a");
    for(let i = 0; i < row_line_a_tags.length; i++)
        countries.push(row_line_a_tags[i]?.href.replace("/country/",""));
    return countries;
}
function gomovies_parse_watch_page_production(row_line : Element) : HrefString[] { 
    let productions : HrefString[] = [];
    const row_line_a_tags = row_line.querySelectorAll("a");
    for(let i = 0; i < row_line_a_tags.length; i++)
        productions.push({"str":row_line_a_tags[i]?.innerHTML,"href": row_line_a_tags[i]?.href.replace("/production/","")});
    return productions;
}
export function gomovies_movie_href_to_movie_id(movie_href : string) : string{
    return movie_href.replace(/(watch-)?movie\/watch.+?gomovies-/,'');
}
export async function gomovies_get_vote_info(movie_href : string) : Promise<string>{
    const vote_info_html_data = (await axios.get(`vote_info/${gomovies_movie_href_to_movie_id(movie_href)}`, {"baseURL": GOMOVIES_BASE_AJAX_URL, "headers": GOMOVIES_DEFAULT_AJAX_HEADERS})).data;
    const { window } = new JSDOM(vote_info_html_data);
    return window.document.querySelector(".rr-mark")?.textContent;
}
async function gomovies_get_sources_list(movie_href : string) : Promise< GoMovieSourceData[] > {
    const movie_id = gomovies_movie_href_to_movie_id(movie_href);
    const ajax_sources_data = (await axios.get(`episode/list/${movie_id}`, {"baseURL": GOMOVIES_BASE_AJAX_URL, "headers": GOMOVIES_DEFAULT_AJAX_HEADERS})).data;
    const { window } = new JSDOM(ajax_sources_data);
    const sources_and_titles : GoMovieSourceData[] = [];
    window.document.querySelectorAll(".btn-sm").forEach(source => {sources_and_titles.push(
        {"host": source?.getAttribute("title"), "data_linkid": source?.getAttribute("data-linkid")}
    )});
    return sources_and_titles;
}
async function gomovies_parse_movie_watch_page(page_html : string, movie_href : string) : Promise<GoMovieMovie> {
    const { window } = new JSDOM(page_html);
    const doc = window.document;
    const row_lines = doc.querySelectorAll(".row-line");

    const goMovie : GoMovieMovie = {
        "id": gomovies_movie_href_to_movie_id(movie_href),
        "title" : doc.querySelector(".breadcrumb-item.active")?.innerHTML,
        "href" : movie_href,
        "thumbnail_url" : doc.querySelector(".film-poster-img")?.getAttribute("src"),
        "trailer_url" : doc.querySelector("#iframe-trailer")?.getAttribute("data-src"),
        "quality" : doc.querySelector(".btn-quality")?.children[0]?.innerHTML,
        "imdb_rating" : doc.querySelector(".btn-imdb")?.innerHTML.replace("IMDB: ",''),
        "released" : row_lines[0]?.textContent.replaceAll(/\s{2,}|\n/g,' ').replace("Released: ",'').trim(),
        "genres" : gomovies_parse_watch_page_genres(row_lines[1]),
        "cast" : gomovies_parse_watch_page_cast(row_lines[2]),
        "duration" : row_lines[3]?.textContent.replaceAll(/\s{2,}|\n/g,' ').replace("Duration: ",'').trim(),
        "countries" : gomovies_parse_watch_page_countries(row_lines[4]),
        "productions" : gomovies_parse_watch_page_production(row_lines[5]),
        "description" : doc.querySelector(".description")?.textContent.replaceAll(/\s{2,}|\n/g,' ').trim(),
        "vote_info": await gomovies_get_vote_info(movie_href),
        "sources_list": await gomovies_get_sources_list(movie_href),
        "may_also_like": gomovies_flw_items_to_gomovies_display_contents(doc),
    };
    return goMovie;
}
export async function gomovies_watch_movie(movie_href : string) : Promise<GoMovieMovie>{
    const watch_movie_html_data = (await axios.get(movie_href, {"baseURL": GOMOVIES_BASE_URL, "headers": GOMOVIES_DEFAULT_HEADERS})).data;
    return await gomovies_parse_movie_watch_page(watch_movie_html_data, movie_href);
}
export async function gomovies_data_linkid_to_source(data_linkid : string){
    const ajax_sources_json : GoMovieAjaxSource = (await axios.get(`sources/${data_linkid}`, {"baseURL": GOMOVIES_BASE_AJAX_URL, "headers": GOMOVIES_DEFAULT_AJAX_HEADERS})).data;
    const vidcloud_data_id_regex = /(.+?\/)+(.+?)\?/;
    const vidcloud_data_id = vidcloud_data_id_regex.exec(ajax_sources_json.link)[2];
}
export async function gomovies_watch_tv_show(){}
