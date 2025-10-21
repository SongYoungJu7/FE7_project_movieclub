import React, { useState, useRef } from "react";
import defaultProfile from "../assets/default-profile.svg";
import profileCameraBtn from "../assets/profile-camera-btn.svg";
import FilterDropdown from "../components/common/buttons/FilterDropdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";
import { useUserProfile } from "../hooks/useUserProfile";
import { FILTER_OPTIONS, type FilterOption } from "../types/Filter";
import { ClipLoader } from "react-spinners";

// ✅ 1. 필요한 모든 목록 컴포넌트 import (MyLikedCommentReviewsList 추가)
import MyCommentedReviewsList from "../components/reviews/MyCommentedReviewsList";
import MyPostedReviewsList from "../components/reviews/MyPostedReviewsList";
import MyLikedReviewsList from "../components/reviews/MyLikedReviewsList";
import MyLikedCommentReviewsList from "../components/reviews/MyLikedCommentReviewsList"; // ✅ 새로 추가

/* -----------------------------------------------
  Helper Functions (변경 없음)
----------------------------------------------- */

// 아바타 업로드
async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `avatar/${userId}.${fileExt}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;
  const cacheBustingUrl = `${publicUrl}?t=${new Date().getTime()}`;
  const { error: dbError } = await supabase
    .from("users")
    .update({ avatar_url: cacheBustingUrl })
    .eq("id", userId);
  if (dbError) throw dbError;
  return cacheBustingUrl;
}

// 아바타 삭제
async function deleteAvatar(
  userId: string,
  currentUrl: string | null | undefined
): Promise<void> {
  if (!currentUrl) return;
  const urlWithoutQuery = currentUrl.split("?")[0];
  const pathInBucket = urlWithoutQuery.split("/avatars/")[1];
  if (pathInBucket) {
    const { error: removeError } = await supabase.storage
      .from("avatars")
      .remove([pathInBucket]);
    if (removeError) throw removeError;
  }
  const { error: dbError } = await supabase
    .from("users")
    .update({ avatar_url: null })
    .eq("id", userId);
  if (dbError) throw dbError;
}

/* -----------------------------------------------
  Profile Component
----------------------------------------------- */
export const Profile: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { profile, loading: isProfileLoading } = useUserProfile();
  const userId = profile?.id?.toString();

  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const avatarUrl = tempPreview || profile?.avatar_url || defaultProfile;

  /* ------------------------
      Mutations (변경 없음)
  ------------------------ */
  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      if (!userId) throw new Error("User not logged in");
      return uploadAvatar(userId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      setTempPreview(null);
    },
    onError: () => {
      setTempPreview(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("User not logged in");
      return deleteAvatar(userId, profile?.avatar_url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });

  /* ------------------------
      Event Handlers
  ------------------------ */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTempPreview(URL.createObjectURL(file));
    uploadMutation.mutate(file);
  };

  const handleClick = () => fileInputRef.current?.click();
  const handleDelete = () => deleteMutation.mutate();

  const isLoading =
    isProfileLoading || uploadMutation.isPending || deleteMutation.isPending;

  // ✅ 2. 'likesFilter' state 및 핸들러 복원
  const [myPostsFilter, setMyPostsFilter] = useState<FilterOption>(
    FILTER_OPTIONS.MyPosts[0]
  );
  const [likesFilter, setLikesFilter] = useState<FilterOption>(
    FILTER_OPTIONS.Likes[0] // (가정: FILTER_OPTIONS.Likes[0]는 '리뷰')
  );

  const handleChangeFilter1 = (filter: FilterOption) => {
    setMyPostsFilter(filter);
  };
  const handleChangeFilter2 = (filter: FilterOption) => {
    setLikesFilter(filter);
  };

  /* ------------------------
      JSX
  ------------------------ */
  return (
    <div className="relative w-full min-h-screen bg-[var(--color-background-main)]">
      {/* 제목 (변경 없음) */}
      <h1 className="top-0 left-0 text-[32px] font-bold text-[var(--color-text-main)]">
        프로필 설정
      </h1>

      {/* 아바타 업로드 영역 (변경 없음) */}
      <div className="absolute top-15 left-0 w-[650px] h-[230px] bg-[var(--color-background-sub)] rounded-[10px] card-shadow flex items-center px-6">
        <div className="relative flex flex-col items-center flex-shrink-0">
          <div
            className={`w-full h-full rounded-full border-2 border-[var(--color-text-placeholder)] cursor-pointer hover:border-[var(--color-main)] relative ${
              isLoading ? "opacity-50" : ""
            }`}
            onClick={!isLoading ? handleClick : undefined}
          >
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-[120px] h-[120px] object-cover rounded-full"
            />
            <img
              src={profileCameraBtn}
              alt="Camera"
              className="absolute bottom-0 right-0 cursor-pointer"
            />
          </div>
          {/* 업로드 중일 때 Spinner 오버레이 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-background-sub)] rounded-full">
              <ClipLoader color="var(--color-main)" size={35} />
            </div>
          )}
          <button
            className="mt-2 text-[var(--color-alert)] text-sm font-medium hover:underline"
            onClick={handleDelete}
            disabled={deleteMutation.isPending || !profile?.avatar_url}
          >
            {deleteMutation.isPending ? "삭제 중..." : "이미지 삭제"}
          </button>
        </div>
        <div className="ml-6 text-[16px] font-medium items-start -mt-[15px] text-[var(--color-text-main)] leading-6 flex">
          <div>
            내 프로필 이미지를 올려주세요
            <br />
            이미지는{" "}
            <span className="text-[var(--color-main)] font-medium">
              JPG, JPEG, PNG
            </span>{" "}
            형식만 업로드할 수 있습니다.
          </div>
        </div>
      </div>

      {/* 숨겨진 파일 input (변경 없음) */}
      <input
        type="file"
        accept="image/jpeg, image/png, image/jpg"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploadMutation.isPending}
      />

      {/* 내 게시물 필터 (변경 없음) */}
      <div className="w-full flex flex-col items-start mt-70">
        <h1 className="text-[32px] font-bold text-[var(--color-text-main)] mb-2">
          내 게시물
        </h1>
        <div className="z-50 w-[200px] h-[40px]">
          <FilterDropdown
            type="MyPosts"
            filter={myPostsFilter}
            handleChangeFilter={handleChangeFilter1}
          />
        </div>
        <div className="mt-4 w-full">
          {myPostsFilter.value === "댓글" ? (
            <MyCommentedReviewsList authorId={userId} variant="profile" />
          ) : (
            <MyPostedReviewsList authorId={userId} variant="profile" />
          )}
        </div>
      </div>

      {/* 내가 좋아요한 게시물 필터 */}
      <div className="w-full flex flex-col items-start mt-10">
        <h1 className="text-[32px] font-bold text-[var(--color-text-main)] mb-2">
          좋아요
        </h1>

        {/* ✅ FilterDropdown 유지 */}
        <div className="z-50 w-[200px] h-[40px]">
          <FilterDropdown
            type="Likes"
            filter={likesFilter}
            handleChangeFilter={handleChangeFilter2}
          />
        </div>

        {/* ✅ 내부 스켈레톤 제거, ReviewList 내부의 스켈레톤만 사용 */}
        <div className="mt-4 w-full">
          {likesFilter.value === "댓글" ? (
            <MyLikedCommentReviewsList authorId={userId} variant="profile" />
          ) : (
            <MyLikedReviewsList authorId={userId} variant="profile" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
// import React, { useState, useRef } from "react";
// import defaultProfile from "../assets/default-profile.svg";
// import profileCameraBtn from "../assets/profile-camera-btn.svg";
// import FilterDropdown from "../components/common/buttons/FilterDropdown";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "../utils/supabase";
// import { useUserProfile } from "../hooks/useUserProfile";
// import { FILTER_OPTIONS, type FilterOption } from "../types/Filter";

// /* -----------------------------------------------
//   Helper Functions
// ----------------------------------------------- */

// // 아바타 업로드
// async function uploadAvatar(userId: string, file: File): Promise<string> {
//   const fileExt = file.name.split(".").pop();
//   const fileName = `avatar/${userId}.${fileExt}`;

//   // 1. 스토리지 업로드
//   const { error: uploadError } = await supabase.storage
//     .from("avatars")
//     .upload(fileName, file, { upsert: true });
//   if (uploadError) throw uploadError;

//   // 2. Public URL 가져오기 + 캐시 방지
//   const { data: urlData } = supabase.storage
//     .from("avatars")
//     .getPublicUrl(fileName);
//   const publicUrl = urlData.publicUrl;
//   const cacheBustingUrl = `${publicUrl}?t=${new Date().getTime()}`;

//   // 3. DB 업데이트
//   const { error: dbError } = await supabase
//     .from("users")
//     .update({ avatar_url: cacheBustingUrl })
//     .eq("id", userId);
//   if (dbError) throw dbError;

//   return cacheBustingUrl;
// }

// // 아바타 삭제
// async function deleteAvatar(
//   userId: string,
//   currentUrl: string | null | undefined
// ): Promise<void> {
//   if (!currentUrl) return;

//   const urlWithoutQuery = currentUrl.split("?")[0];
//   const pathInBucket = urlWithoutQuery.split("/avatars/")[1];

//   if (pathInBucket) {
//     const { error: removeError } = await supabase.storage
//       .from("avatars")
//       .remove([pathInBucket]);
//     if (removeError) throw removeError;
//   }

//   const { error: dbError } = await supabase
//     .from("users")
//     .update({ avatar_url: null })
//     .eq("id", userId);
//   if (dbError) throw dbError;
// }

// /* -----------------------------------------------
//   Profile Component
// ----------------------------------------------- */
// export const Profile: React.FC = () => {
//   const queryClient = useQueryClient();
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const { profile, loading: isProfileLoading } = useUserProfile();
//   const userId = profile?.id;

//   // 업로드 전 임시 미리보기
//   const [tempPreview, setTempPreview] = useState<string | null>(null);
//   const avatarUrl = tempPreview || profile?.avatar_url || defaultProfile;

//   /* ------------------------
//       Mutations
//   ------------------------ */

//   // 업로드 mutation
//   const uploadMutation = useMutation({
//     mutationFn: (file: File) => {
//       if (!userId) throw new Error("User not logged in");
//       return uploadAvatar(userId, file);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
//       setTempPreview(null);
//     },
//     onError: () => {
//       setTempPreview(null);
//     },
//   });

//   // 삭제 mutation
//   const deleteMutation = useMutation({
//     mutationFn: () => {
//       if (!userId) throw new Error("User not logged in");
//       return deleteAvatar(userId, profile?.avatar_url);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
//     },
//   });

//   /* ------------------------
//       Event Handlers
//   ------------------------ */

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setTempPreview(URL.createObjectURL(file));
//     uploadMutation.mutate(file);
//   };

//   const handleClick = () => fileInputRef.current?.click();
//   const handleDelete = () => deleteMutation.mutate();

//   const isLoading =
//     isProfileLoading || uploadMutation.isPending || deleteMutation.isPending;

//   // ✅ [수정] filter state를 두 개로 분리합니다.
//   // '내 게시물' 필터 state
//   const [myPostsFilter, setMyPostsFilter] = useState<FilterOption>(
//     FILTER_OPTIONS.MyPosts[0]
//   );
//   // '좋아요' 필터 state
//   // (FILTER_OPTIONS에 Likes가 정의되어 있다고 가정)
//   const [likesFilter, setLikesFilter] = useState<FilterOption>(
//     FILTER_OPTIONS.Likes[0]
//   );

//   // ✅ [수정] 각 핸들러가 올바른 state를 업데이트하도록 변경합니다.
//   const handleChangeFilter1 = (filter: FilterOption) => {
//     setMyPostsFilter(filter); // '내 게시물' state 업데이트
//   };
//   const handleChangeFilter2 = (filter: FilterOption) => {
//     setLikesFilter(filter); // '좋아요' state 업데이트
//   };

//   /* ------------------------
//       JSX
//   ------------------------ */
//   return (
//     <div className="relative w-full h-screen bg-[var(--color-background-main)]">
//       {/* 제목 */}
//       <h1 className="top-0 left-0 text-[32px] font-bold text-[var(--color-text-main)]">
//         프로필 설정
//       </h1>

//       {/* 아바타 업로드 영역 */}
//       <div className="absolute top-15 left-0 w-[650px] h-[230px] bg-[var(--color-background-sub)] rounded-[10px] card-shadow flex items-center px-6">
//         <div className="relative flex flex-col items-center flex-shrink-0">
//           {/* 프로필 이미지 */}
//           <div
//             className={`w-full h-full rounded-full border-2 border-[var(--color-text-placeholder)] cursor-pointer hover:border-[var(--color-main)] relative ${
//               isLoading ? "opacity-50" : ""
//             }`}
//             onClick={!isLoading ? handleClick : undefined}
//           >
//             <img
//               src={avatarUrl}
//               alt="Profile"
//               className="w-[120px] h-[120px] object-cover rounded-full"
//             />
//             <img
//               src={profileCameraBtn}
//               alt="Camera"
//               className="absolute bottom-0 right-0 cursor-pointer"
//             />
//           </div>

//           {/* 삭제 버튼 */}
//           <button
//             className="mt-2 text-[var(--color-alert)] text-sm font-medium hover:underline"
//             onClick={handleDelete}
//             disabled={deleteMutation.isPending || !profile?.avatar_url}
//           >
//             {deleteMutation.isPending ? "삭제 중..." : "이미지 삭제"}
//           </button>
//         </div>

//         {/* 안내 문구 */}
//         <div className="ml-6 text-[16px] font-medium items-start -mt-[15px] text-[var(--color-text-main)] leading-6 flex">
//           <div>
//             내 프로필 이미지를 올려주세요
//             <br />
//             이미지는{" "}
//             <span className="text-[var(--color-main)] font-medium">
//               JPG, JPEG, PNG
//             </span>{" "}
//             형식만 업로드할 수 있습니다.
//           </div>
//         </div>
//       </div>

//       {/* 숨겨진 파일 input */}
//       <input
//         type="file"
//         accept="image/jpeg, image/png, image/jpg"
//         ref={fileInputRef}
//         onChange={handleFileChange}
//         className="hidden"
//         disabled={uploadMutation.isPending}
//       />

//       {/* 내 게시물 필터 */}
//       <div className="w-full flex flex-col items-start mt-70">
//         <h1 className="text-[32px] font-bold text-[var(--color-text-main)] mb-2">
//           내 게시물
//         </h1>
//         <div className="z-50 w-[200px] h-[40px]">
//           <FilterDropdown
//             type="MyPosts"
//             filter={myPostsFilter}
//             handleChangeFilter={handleChangeFilter1}
//           />
//         </div>
//       </div>

//       {/* 내가 좋아요한 게시물 필터 */}
//       <div className="w-full flex flex-col items-start mt-10">
//         <h1 className="text-[32px] font-bold text-[var(--color-text-main)] mb-2">
//           좋아요
//         </h1>
//         <div className="z-50 w-[200px] h-[40px]">
//           <FilterDropdown
//             type="Likes"
//             filter={likesFilter}
//             handleChangeFilter={handleChangeFilter2}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;
