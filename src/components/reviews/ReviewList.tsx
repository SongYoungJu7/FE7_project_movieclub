import { useEffect, useState, useRef, useCallback } from "react";
import ReviewsRendering from "./ReviewsRendering";
import { supabase } from "../../utils/supabase";
import type { ReviewSubset } from "../../types/Review";
import type { FilterOption } from "../../types/Filter";

type Props = {
  variant?: "page" | "home" | "profile";
  filter?: FilterOption;
  movie_id?: number | null; // movie_id 타입 에러 수정
  authorId?: string | null;
};

const DEFAULT_FILTER: FilterOption = {
  value: "최신순",
};

const MIN_LOADING_TIME = 2000; // 최소 로딩시간 (1초)
const PAGE_SIZE_PAGE = 20; // 페이지 화면에서 한 번에 가져올 개수
const PAGE_SIZE_HOME = 4; // 홈/프로필에서 보여줄 개수

export default function ReviewList({
  variant = "page",
  filter = DEFAULT_FILTER,
  movie_id,
  authorId,
}: Props) {
  const [data, setData] = useState<ReviewSubset[]>([]);

  // 초기 로딩 관련 (스켈레톤 최소 노출 유지)
  const [isLoading, setIsLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);

  // 무한 스크롤 관련
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 최소 로딩 시간 로직 (초기 페치에만 적용)
  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
    } else {
      const timer = setTimeout(() => setShowLoading(false), MIN_LOADING_TIME);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  /** 공통 쿼리 빌더 */
  const buildBaseQuery = useCallback(() => {
    let query = supabase.from("review_detail").select("*");

    if (authorId) query = query.eq("author_id", authorId);
    if (movie_id) query = query.eq("movie_id", movie_id);

    // 정렬: 인기순 또는 최신순, 그리고 안정적인 페이징을 위한 2차 정렬
    if (filter.value === "인기순") {
      // 좋아요 많은 순, 동률이면 최신순
      query = query
        .order("likes", { ascending: false })
        .order("created_at", { ascending: false });
    } else {
      // 기본: 최신순, 동률이면 id 내림차순
      query = query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
    }

    return query;
  }, [authorId, movie_id, filter.value]);

  /** 한 페이지 로드 */
  const fetchPage = useCallback(
    async (
      targetPage: number,
      { replace = false }: { replace?: boolean } = {}
    ) => {
      if (variant === "home" || variant === "profile") return; // 홈/프로필은 1페이지 고정 노출

      if (targetPage === 1) setIsLoading(true);
      else setIsFetchingMore(true);

      try {
        const from = (targetPage - 1) * PAGE_SIZE_PAGE;
        const to = from + PAGE_SIZE_PAGE - 1;

        const { data: reviews, error } = await buildBaseQuery().range(from, to);
        if (error) throw error;

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const safe = reviews ?? [];
        setData((prev) => (replace ? safe : [...prev, ...safe]));
        setPage(targetPage);

        // 더 가져올게 없으면 hasMore = false
        setHasMore(safe.length === PAGE_SIZE_PAGE);
      } catch (e) {
        console.error(e);
        setHasMore(false);
        if (targetPage === 1) setData([]);
      } finally {
        if (targetPage === 1) setIsLoading(false);
        else setIsFetchingMore(false);
      }
    },
    [variant, buildBaseQuery]
  );

  /** 초기 로드 & 조건 변경 시 초기화 */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // 홈/프로필: 고정 개수만 보여주고 무한 스크롤 비활성
      if (variant === "home" || variant === "profile") {
        setIsLoading(true);
        try {
          const { data: reviews, error } = await buildBaseQuery().range(
            0,
            PAGE_SIZE_HOME - 1
          );
          if (error) throw error;
          if (!mounted) return;
          setData(reviews ?? []);
        } catch (e) {
          console.error(e);
          if (mounted) setData([]);
        } finally {
          if (mounted) setIsLoading(false);
        }
        return;
      }

      // page 변형: 무한 스크롤
      setData([]);
      setPage(1);
      setHasMore(true);
      await fetchPage(1, { replace: true });
    };

    init();
    return () => {
      mounted = false;
    };
  }, [variant, filter.value, authorId, movie_id, buildBaseQuery, fetchPage]);

  /** IntersectionObserver: 끝에 닿으면 다음 페이지 로드 */
  useEffect(() => {
    if (variant !== "page") return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (!hasMore) return;
        if (isLoading || isFetchingMore) return;
        fetchPage(page + 1);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [variant, page, hasMore, isLoading, isFetchingMore, fetchPage]);

  return (
    <div className="w-full">
      <ReviewsRendering data={data} variant={variant} isLoading={showLoading} />

      {variant === "page" && (
        <div className="w-full flex flex-col items-center mt-6">
          <div ref={sentinelRef} className="h-6 w-6" aria-hidden />
          {isFetchingMore && (
            <div className="mt-2 text-sm text-text-sub">불러오는 중...</div>
          )}
          {!isLoading && !isFetchingMore && !hasMore && (
            <div className="mt-2 text-sm text-text-sub">
              모든 리뷰를 불러왔습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
