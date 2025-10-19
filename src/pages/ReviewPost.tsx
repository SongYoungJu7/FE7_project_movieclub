import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useAuthStore } from "../stores/authStore";
import ReviewPostBtn from "../components/reviews/ReviewPostBtn";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { HashtagIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { keyForSearch } from "../api/tmdb/tmdb";

export default function ReviewPostPage() {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.id);

  /* ------------------------
      Local States
  ------------------------ */
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [selectMovie, setSelectMovie] = useState<MovieInReview | null>(null);
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const [movies, setMovies] = useState<MovieInReview[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MovieInReview | null>(null);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  /* ------------------------
      Fetch Movies from TMDB
  ------------------------ */
  useEffect(() => {
    setIsLoading(true);

    if (!query) {
      setMovies([]);
      return;
    }

    const fetchMoviesFromTMDB = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
            query
          )}&api_key=${keyForSearch}&language=ko-KR`
        );
        const data: { results: Movie[] } = await response.json();

        const moviesData: MovieInReview[] = data.results.map(
          ({ id, title, backdrop_path }) => ({
            id,
            title,
            backdrop: `${IMAGE_BASE_URL}${backdrop_path}`,
          })
        );

        setMovies(moviesData);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoviesFromTMDB();
  }, [query]);

  /* ------------------------
      Thumbnail Upload / Remove
  ------------------------ */
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setThumbnail(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => setThumbnail("");

  /* ------------------------
      Form Submit
  ------------------------ */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const finalThumbnail =
      thumbnail.trim() ||
      selectMovie?.backdrop ||
      "https://mrwvwylqxypdithozmgm.supabase.co/storage/v1/object/public/img/movie_no_image.jpg";

    if (!title || !selectMovie || !content) {
      alert("값을 모두 입력해주세요.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          author_id: userId,
          title,
          content,
          thumbnail: finalThumbnail,
          movie_id: selectMovie.id,
          movie_name: selectMovie.title,
        })
        .select()
        .single();

      if (data) {
        alert("게시글이 등록되었습니다.");
        navigate("/reviews");
      }
      if (error) throw error;
    } catch (err) {
      console.error("Failed to post review:", err);
    }
  };

  /* ------------------------
      Render Form
  ------------------------ */
  return (
    <div className="review-post text-text-main">
      <h1 className="text-[40px] font-bold mb-7">리뷰 작성</h1>

      <form className="mr-40" onSubmit={handleSubmit}>
        {/* 제목 입력 */}
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-[28px] pl-3 pb-3 w-full mb-5 outline-0 border-b-1 border-text-light placeholder:text-text-light focus:border-main"
          required
        />

        <div className="relative w-[268px]">
          {/* 영화 선택 Combobox */}
          <Combobox<MovieInReview>
            value={selected!}
            onChange={(value) => {
              if (!value) return;
              setSelected(value);
              setSelectMovie({
                id: value.id,
                title: value.title,
                backdrop: value.backdrop,
              });
            }}
            onClose={() => setQuery("")}
          >
            <div
              className={clsx(
                "w-[268px] h-[40px] border rounded-[30px] flex justify-start items-center",
                isInputFocus ? "border-main" : "border-text-light"
              )}
            >
              <HashtagIcon
                className={clsx(
                  "size-4 ml-3.5",
                  selected ? "fill-main" : "fill-text-sub"
                )}
              />
              <ComboboxInput
                autoComplete="off"
                placeholder="영화 제목을 입력하세요"
                onFocus={() => setIsInputFocus(true)}
                onBlur={() => setIsInputFocus(false)}
                className={clsx(
                  "movie-name border-none bg-background-main py-1.5 pl-3 text-sm/6 outline-0 placeholder:text-text-placeholder",
                  selected ? "text-main" : " text-sub"
                )}
                displayValue={(movie: MovieInReview) => movie?.title ?? ""}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
            </div>

            {/* Combobox Options */}
            {movies.length > 0 && (
              <ComboboxOptions
                className="absolute z-50 w-[268px] rounded-[20px] border border-main bg-background-main p-1 mt-1 transition duration-100 ease-in
               max-h-60 overflow-y-auto"
              >
                {movies.map((movie) => (
                  <ComboboxOption
                    key={movie.id}
                    value={movie}
                    className="group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
                  >
                    <div className="text-sm/6 text-text-sub hover:bg-main-10 w-full px-3 rounded-[inherit]">
                      {movie.title}
                    </div>
                  </ComboboxOption>
                ))}
              </ComboboxOptions>
            )}
          </Combobox>
        </div>

        {/* 내용 입력 */}
        <textarea
          rows={20}
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 mt-5 mb-5 border border-text-light outline-0 rounded-md focus:outline-none focus:border-main resize-none text-sm"
          required
        />

        {/* 썸네일 업로드 */}
        <div className="review-post-thumbnail flex mb-5">
          <div className="review-thumbnail-btns mr-3 flex flex-col">
            {!thumbnail ? (
              <label
                htmlFor="thumbnail"
                className="inline-flex items-center px-3 py-1 border rounded-[10px] border-text-light bg-background-main text-text-main hover:border-main hover:bg-main-10 transition-colors cursor-pointer"
              >
                이미지 첨부
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailUpload}
                />
              </label>
            ) : (
              <>
                <label
                  htmlFor="thumbnail"
                  className="inline-flex items-center px-3 py-1 border rounded-[10px] border-text-light bg-background-main text-text-main hover:border-main hover:bg-main-10 transition-colors cursor-pointer mb-3"
                >
                  이미지 변경
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                  />
                </label>
                <button type="button" onClick={removeThumbnail}>
                  <span className="inline-flex items-center px-3 py-1 border rounded-[10px] border-text-light bg-background-main text-text-main hover:border-main hover:bg-main-10 transition-colors cursor-pointer">
                    이미지 삭제
                  </span>
                </button>
              </>
            )}
          </div>
          {thumbnail && (
            <img
              src={thumbnail}
              className="max-w-[400px] max-h-[300px] object-cover"
              alt="Thumbnail Preview"
            />
          )}
        </div>

        {/* 제출 버튼 */}
        <ReviewPostBtn type="submit" />
      </form>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../utils/supabase";
// import { useAuthStore } from "../stores/authStore";
// import ReviewPostBtn from "../components/reviews/ReviewPostBtn";
// import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
// import { HashtagIcon } from "@heroicons/react/20/solid";
// import clsx from "clsx";

// export default function ReviewPostPage() {
//   const navigate = useNavigate();
//   const userId = useAuthStore((state) => state.user?.id);

//   /* ------------------------
//       Local States
//   ------------------------ */
//   const [isLoading, setIsLoading] = useState(true);

//   const [title, setTitle] = useState("");
//   const [selectMovie, setSelectMovie] = useState<MovieInReview | null>(null);
//   const [content, setContent] = useState("");
//   const [thumbnail, setThumbnail] = useState("");

//   const [movies, setMovies] = useState<MovieInReview[]>([]);
//   const [query, setQuery] = useState("");
//   const [selected, setSelected] = useState<MovieInReview | null>(null);
//   const [isInputFocus, setIsInputFocus] = useState(true);

//   /* ------------------------
//       Fetch Movies from DB
//   ------------------------ */
//   useEffect(() => {
//     setIsLoading(true);

//     const fetchMovies = async () => {
//       try {
//         const { data, error } = await supabase.from("movies").select("*");
//         if (error) throw error;

//         const moviesData: MovieInReview[] = data.map(({ movie_id, movie_name, backdrop_img }) => ({
//           id: movie_id,
//           title: movie_name,
//           backdrop: backdrop_img,
//         }));

//         setMovies(moviesData);
//       } catch (err) {
//         console.error("Failed to fetch movies:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchMovies();
//   }, []);

//   /* ------------------------
//       Filtered Movies for Combobox
//   ------------------------ */
//   const filteredMovies = query
//     ? movies.filter((movie) => movie.title.toLowerCase().includes(query.toLowerCase()))
//     : movies;

//   /* ------------------------
//       Thumbnail Upload / Remove
//   ------------------------ */
//   const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => setThumbnail(e.target?.result as string);
//     reader.readAsDataURL(file);
//   };

//   const removeThumbnail = () => setThumbnail("");

//   /* ------------------------
//       Form Submit
//   ------------------------ */
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const finalThumbnail =
//       thumbnail.trim() ||
//       selectMovie?.backdrop ||
//       "https://mrwvwylqxypdithozmgm.supabase.co/storage/v1/object/public/img/movie_no_image.jpg";

//     if (!title || !selectMovie || !content) {
//       alert("값을 모두 입력해주세요.");
//       return;
//     }

//     try {
//       const { data, error } = await supabase
//         .from("reviews")
//         .insert({
//           author_id: userId,
//           title,
//           content,
//           thumbnail: finalThumbnail,
//           movie_id: selectMovie.id,
//           movie_name: selectMovie.title,
//         })
//         .select()
//         .single();

//       if (data) {
//         alert("게시글이 등록되었습니다.");
//         navigate("/reviews");
//       }
//       if (error) throw error;
//     } catch (err) {
//       console.error("Failed to post review:", err);
//     }
//   };

//   /* ------------------------
//       Loading State
//   ------------------------ */
//   if (isLoading) {
//     return <p>로딩중...</p>;
//   }

//   /* ------------------------
//       Render Form
//   ------------------------ */
//   return (
//     <div className="review-post text-text-main">
//       <h1 className="text-[40px] font-bold mb-7">리뷰 작성</h1>

//       <form className="mr-40" onSubmit={handleSubmit}>
//         {/* 제목 입력 */}
//         <input
//           type="text"
//           placeholder="제목을 입력하세요"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="text-[28px] pl-3 pb-3 w-full mb-5 outline-0 border-b-1 border-text-light placeholder:text-text-light focus:border-main"
//           required
//         />

//         {/* 영화 선택 Combobox */}
//         <Combobox<MovieInReview>
//           value={selected!}
//           onChange={(value) => {
//             if (!value) return;
//             setSelected(value);
//             setSelectMovie({ id: value.id, title: value.title, backdrop: value.backdrop });
//           }}
//           onClose={() => setQuery("")}
//         >
//           <div
//             className={clsx(
//               "w-[268px] h-[40px] border rounded-[30px] flex justify-start items-center",
//               isInputFocus ? "border-main" : "border-text-light"
//             )}
//           >
//             <HashtagIcon
//               className={clsx("size-4 ml-3.5", selected ? "fill-main" : "fill-text-sub")}
//             />
//             <ComboboxInput
//               placeholder="영화 제목을 입력하세요"
//               onFocus={(e) => {
//                 e.target.placeholder = "";
//                 setIsInputFocus(true);
//               }}
//               onBlur={(e) => {
//                 e.target.placeholder = "영화 제목을 입력하세요";
//                 setIsInputFocus(false);
//               }}
//               className={clsx(
//                 "movie-name border-none bg-background-main py-1.5 pl-3 text-sm/6 outline-0 placeholder:text-text-placeholder",
//                 selected ? "text-main" : " text-sub"
//               )}
//               displayValue={(movie: { id: number; title: string }) => movie?.title}
//               onChange={(e) => setQuery(e.target.value)}
//               required
//             />
//           </div>

//           <ComboboxOptions
//             anchor="bottom"
//             transition
//             className="w-(--input-width) rounded-[20px] border border-main bg-background-main p-1 mt-1 empty:invisible transition duration-100 ease-in"
//           >
//             {filteredMovies.map((movie) => (
//               <ComboboxOption
//                 key={movie.id}
//                 value={movie}
//                 className="group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
//               >
//                 <div className="text-sm/6 text-text-sub hover:bg-main-10 w-full px-3 rounded-[inherit]">
//                   {movie.title}
//                 </div>
//               </ComboboxOption>
//             ))}
//           </ComboboxOptions>
//         </Combobox>

//         {/* 내용 입력 */}
//         <textarea
//           rows={20}
//           placeholder="내용을 입력하세요"
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           className="w-full px-3 py-2 mt-5 mb-5 border border-text-light outline-0 rounded-md focus:outline-none focus:border-main resize-none text-sm"
//           required
//         />

//         {/* 썸네일 업로드 */}
//         <div className="review-post-thumbnail flex mb-5">
//           <div className="review-thumbnail-btns mr-3 flex flex-col">
//             {!thumbnail ? (
//               <label
//                 htmlFor="thumbnail"
//                 className="inline-flex items-center px-3 py-1 border rounded-[10px] border-text-light bg-background-main text-text-main hover:border-main hover:bg-main-10 transition-colors cursor-pointer"
//               >
//                 이미지 첨부
//                 <input type="file" id="thumbnail" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
//               </label>
//             ) : (
//               <>
//                 <label
//                   htmlFor="thumbnail"
//                   className="inline-flex items-center px-3 py-1 border rounded-[10px] border-text-light bg-background-main text-text-main hover:border-main hover:bg-main-10 transition-colors cursor-pointer mb-3"
//                 >
//                   이미지 변경
//                   <input type="file" id="thumbnail" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
//                 </label>
//                 <button type="button" onClick={removeThumbnail}>
//                   <span className="inline-flex items-center px-3 py-1 border rounded-[10px] border-text-light bg-background-main text-text-main hover:border-main hover:bg-main-10 transition-colors cursor-pointer">
//                     이미지 삭제
//                   </span>
//                 </button>
//               </>
//             )}
//           </div>
//           {thumbnail && <img src={thumbnail} className="max-w-[400px] max-h-[300px] object-cover" alt="Thumbnail Preview" />}
//         </div>

//         {/* 제출 버튼 */}
//         <ReviewPostBtn type="submit" />
//       </form>
//     </div>
//   );
// }
