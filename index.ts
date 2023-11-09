import * as gomovies from "./GoMovies";
import * as enumGM from './GoMovies/enumsGM';

async function main() {
    // console.log( await gomovies.gomovies_get_vote_info("watch-movie/watch-five-nights-at-freddys-gomovies-41631"));
    // console.log(await gomovies.gomovies_watch_movie("watch-movie/watch-five-nights-at-freddys-gomovies-41631"));
    console.log(await gomovies.gomovies_data_linkid_to_source("10042261"))
}
main();