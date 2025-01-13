# Git 브랜치 네이밍 규칙

### 1. `master` & `develop` 브랜치
- `master`와 `develop` 브랜치는 본래 이름 그대로 사용하는 것이 일반적입니다.
  - **`master`**: 바로 배포가 가능한 브랜치입니다.
  - **`develop`**: 기능 개발이 이루어지는 브랜치입니다.

### 2. `feature` 브랜치
- `feature` 브랜치는 새로운 기능을 개발하는 브랜치입니다.
- 이름 형식: `feature/{기능요약}`
  - 예시: `feature/login`, `feature/register`
- 이슈 추적 시스템을 사용하는 경우, 이슈 번호를 포함하여 브랜치를 생성합니다.
  - 예시: `feature/1-init-project`, `feature/2-build-gradle-script-write
