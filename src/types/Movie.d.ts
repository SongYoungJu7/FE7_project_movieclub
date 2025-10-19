// src/type/Movie.d.ts
interface Actor {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  genres: Genre[];
  title: string;
  original_title: string;
  overview: string;
  cerfication: string;
  year: string;
  runtime: string;
  country: string;
  rating: number;
  poster: string;
  backdrop: string;
  backdrop_path: string;
  director: string;
  actors: Actor[];
  trailer: string;
}

interface MovieInReview {
  id: number;
  title: string;
  backdrop: string;
}
