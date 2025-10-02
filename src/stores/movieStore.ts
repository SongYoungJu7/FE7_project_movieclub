import { create } from "zustand";

export type Movie = {
  id: string;
  title: string;
  year?: number;
  posterUrl?: string;
  genres?: string[];
  rating?: number;
};

interface MovieState {
  movies: Movie[];
  isLoading: boolean;
  fetchMovies: (limit?: number) => Promise<void>;
}

const MOCK_MOVIES: Movie[] = [
  { id: "1", title: "Inception", year: 2010, genres: ["Sci-Fi"], rating: 8.8 },
//   {
//     id: "2",
//     title: "Interstellar",
//     year: 2014,
//     genres: ["Drama"],
//     rating: 8.6,
//   },
//   { id: "3", title: "Joker", year: 2019, genres: ["Crime"], rating: 8.4 },
];

export const useMovieStore = create<MovieState>((set) => ({
  movies: [],
  isLoading: false,
  async fetchMovies(limit) {
    // mock API 호출
    set({ isLoading: true });

    await new Promise((r) => setTimeout(r, 300)); // Mock 지연
    const data = limit ? MOCK_MOVIES.slice(0, limit) : MOCK_MOVIES;
    set({ movies: data, isLoading: false });

    // 실제 API 호출
    //   try {
    //     const res = await fetch(`http://서버주소/movies?limit=${limit}`);
    //     const data = await res.json();
    //     set({ movies: data, isLoading: false });
    //   } catch (err) {
    //     set({ isLoading: false });
    //     console.error(err);
    //   }
  },
}));
