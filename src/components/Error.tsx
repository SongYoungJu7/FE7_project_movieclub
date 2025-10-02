import errorLogo from "../assets/404error.svg";

function Error() {
  return (
    <div className="h-[90vh] flex flex-col items-center justify-center text-center px-4">
      {/* 404 Title */}
      <img
        src={errorLogo}
        alt="errorLogo"
        className="w-[491px] h-[127px] mb-[3.125rem]"
      />
      <div className="flex-col mb-[3.125rem]">
        <div className="mt-4 font-pretendard font-normal text-[#333333] text-[20px]">
          죄송합니다. 페이지를 찾을 수 없습니다.
        </div>
        <div className="mt-4 font-pretendard font-normal text-[20px] text-[#333333]">
          존재하지 않는 주소를 입력하셨거나
        </div>
        <div className="mt-4 font-pretendard font-normal text-[20px] text-[#333333]">
          요청하신 페이지의 주소가 변경, 삭제되어 찾을 수 없습니다.
        </div>
      </div>

      {/* Button placeholder */}
      <div className="mt-6">
        {/* 버튼 컴포넌트 자리 - 팀원이 구현 예정 */}
        <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          홈으로 돌아가기
        </div>
      </div>
    </div>
  );
}

export default Error;
