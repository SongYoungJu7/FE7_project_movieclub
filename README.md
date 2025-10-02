# FE7_project_movieclub

FE7 2차 2팀 프로젝트 "Movie Club"

영화 정보 조회와 리뷰 공유, 댓글·좋아요·메시지 등 소셜 기능을 갖춘 영화 커뮤니티 플랫폼

## 🚀 기술 스택

- React, React Router
- TypeScript
- Tailwind CSS
- Supabase

## 📂 프로젝트 구조

```
root/
├── public/
├── src/
│   ├── components/
│   │   ├─ loading/
│   │   ├─ routes/
│   ├── layouts/
│   │   ├─ Default.tsx
│   ├── css/
│   │   ├─ index.css
│   │   ├─ tailwind.css
│   ├── types/
│   ├── utils/
│   │   ├─ supabase.ts
│   ├── stores/
│   │   ├─ authStore.ts
│   ├── pages/
│   │   ├─ auth/

```

## 🌱 브랜치 네이밍 규칙

| 브랜치 타입 | 네이밍 규칙             | 예시                        | 설명                |
| ----------- | ----------------------- | --------------------------- | ------------------- |
| 기능 개발   | `feature/<기능명>`      | `feature/login`             | 새로운 기능 개발    |
| 버그 수정   | `fix/<이슈번호>-<설명>` | `fix/123-todo-delete-error` | 버그 수정           |
| 리팩토링    | `refactor/<설명>`       | `refactor/auth-flow`        | 코드 구조/성능 개선 |
| 배포        | `develop`               | `develop`                   | 기능 통합           |

## 🎨 Gitmoji

| 이모지 | 코드                 | 설명                               | 예시 커밋 메시지                        |
| ------ | -------------------- | ---------------------------------- | --------------------------------------- |
| ✨     | `:sparkles:`         | 새로운 기능 추가                   | `✨ feat: 로그인 기능 추가`             |
| 🐛     | `:bug:`              | 버그 수정                          | `🐛 fix: 리뷰 삭제 안되던 문제 수정`    |
| ♻️     | `:recycle:`          | 코드 리팩토링                      | `♻️ refactor: auth 로직 정리`           |
| 📝     | `:memo:`             | 문서 추가/수정                     | `📝 docs: README 브랜치 규칙 추가`      |
| 🎨     | `:art:`              | 코드 포맷/스타일 개선 (기능 변경X) | `🎨 style: 변수명 카멜케이스로 수정`    |
| ✅     | `:white_check_mark:` | 테스트 추가/수정                   | `✅ test: 유저 로그인 테스트 추가`      |
| 🔧     | `:wrench:`           | 설정 파일 수정                     | `🔧 config: ESLint 설정 업데이트`       |
| 🔥     | `:fire:`             | 코드/파일 삭제                     | `🔥 remove: 불필요한 mock 데이터 제거`  |
| 📦     | `:package:`          | 패키지 추가/업데이트               | `📦 build: supabase-js 버전 업그레이드` |
| 🚧     | `:construction:`     | 작업 진행 중 (WIP)                 | `🚧 wip: 소셜 로그인 기능 구현 중`      |

## 🚀 Tailwind CSS 테마 변수 사용법

Tailwind CSS v4.0의 CSS 변수와 `@custom-variant`를 사용하여 라이트/다크 모드를 구현합니다. 모든 색상 정의는 `globals.css` 파일의 `@theme` 블록에 중앙 집중화되어 있습니다.

### 📘 테마 구조

| 구분                     | 파일/코드 위치                                                     | 설명                                                                          |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| 다크모드                 | `tailwind.css` → `@custom-variant dark (&:where(.dark, .dark *));` | `.dark` 클래스가 있을 때, @theme에서 정의한 색상을 다크모드 색상으로 덮어씌움 |
| 공통 색상                | `tailwind.css` → `@theme` 블록                                     | 테마와 상관없이 사용하는 색상                                                 |
| 라이트모드 색상 (기본값) | `tailwind.css` → `@theme` 블록                                     | 라이트모드에서 사용하는 기본 색상                                             |
| 다크모드 색상            | `tailwind.css` → `.dark` 블록                                      | 다크모드에서 사용하는 색상                                                    |

### 🎨 색상 변수

| 구분            | 변수                       | 설명                        | 예시                                                                                                                                                                                                     |
| --------------- | -------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **공통 색상**   | `--color-main`             | 메인, 강조 색상             | <span style="background-color:#9858f3;color:#fff;padding:2px 6px;border-radius:3px;">#9858f3</span>                                                                                                      |
|                 | `--color-alert`            | 알림 색상                   | <span style="background-color:#F65050;color:#fff;padding:2px 6px;border-radius:3px;">#F65050</span>                                                                                                      |
|                 | `--color-alert-online`     | 온라인 알림 색상            | <span style="background-color:#59D22D;color:#fff;padding:2px 6px;border-radius:3px;">#59D22D</span>                                                                                                      |
|                 | `--color-alert-friend`     | 친구 알림 색상              | <span style="background-color:#FFD900;color:black;padding:2px 6px;border-radius:3px;">#FFD900</span>                                                                                                     |
| **배경 색상**   | `--color-background-main`  | 메인 배경                   | <span style="background-color:#FFFFFF;color:black;padding:2px 6px;border-radius:3px;">#FFFFFF</span> <span style="background-color:#121212;color:#fff;padding:2px 6px;border-radius:3px;">#121212</span> |
|                 | `--color-background-sub`   | 서브 배경                   | <span style="background-color:#FAFAFA;color:black;padding:2px 6px;border-radius:3px;">#FAFAFA</span> <span style="background-color:#3C3C3C;color:#fff;padding:2px 6px;border-radius:3px;">#3C3C3C</span> |
| **텍스트 색상** | `--color-text-main`        | 기본 텍스트                 | <span style="background-color:#111827;color:#fff;padding:2px 6px;border-radius:3px;">#111827</span> <span style="background-color:#F9FAFB;color:#000;padding:2px 6px;border-radius:3px;">#F9FAFB</span>  |
|                 | `--color-text-sub`         | 보조 텍스트 (main보다 연함) | <span style="background-color:#6B7280;color:#fff;padding:2px 6px;border-radius:3px;">#6B7280</span> <span style="background-color:#D1D5DB;color:#000;padding:2px 6px;border-radius:3px;">#D1D5DB</span>  |
|                 | `--color-text-light`       | 연한 텍스트                 | <span style="background-color:#9CA3AF;color:#fff;padding:2px 6px;border-radius:3px;">#9CA3AF</span> <span style="background-color:#6B7280;color:#fff;padding:2px 6px;border-radius:3px;">#6B7280</span>  |
|                 | `--color-text-placeholder` | 입력창 플레이스홀더         | <span style="background-color:#D1D5DB;color:#000;padding:2px 6px;border-radius:3px;">#D1D5DB</span> <span style="background-color:#374151;color:#fff;padding:2px 6px;border-radius:3px;">#374151</span>  |

### 💡 변수 사용 예시

```tsx
<div className="bg-background-sub p-4">
  <p className="text-main">메인 텍스트</p>
</div>
```

`.dark` 클래스가 적용되면 CSS 변수들이 다크 모드 값으로 자동 변경됩니다.
