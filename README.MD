# RoleBot 🤖

Misskey 인스턴스에서 역할(Role)을 부여하거나 해제하는 간단한 봇입니다.  
특정 명령어(`부여`, `해제`)를 포함한 멘션에 반응하여 사용자의 역할을 자동으로 관리합니다.

---

## 🛠️ 기능

- 역할 부여/해제: Misskey 계정에 특정 역할을 부여하거나 제거합니다.
- 로컬 계정 필터링: 로컬 사용자만 지원하며, 리모트 사용자에게는 적절한 안내 메시지를 전송합니다.
- 안정성: WebSocket 재연결 로직으로 끊김 없는 작동을 보장합니다.
- Docker 지원: Docker를 통해 손쉽게 배포 및 실행할 수 있습니다.

---

## 🔑 API에서 필요한 권한

봇을 정상적으로 작동시키려면 Misskey API에서 다음 권한이 필요합니다:

- admin:roles: 역할 부여 및 해제를 위해 필요합니다.
- write:notes: 답글을 작성하기 위해 필요합니다.
- read:notifications: 멘션 알림을 읽기 위해 필요합니다.

---

## 🚀 Docker로 돌리는 법

이 봇은 Docker 환경에서 손쉽게 실행할 수 있습니다.

### 1️⃣ 요구 사항
- Docker 및 Docker Compose가 설치되어 있어야 합니다.

### 2️⃣ `.env` 파일 설정
프로젝트 루트에 `.env` 파일을 작성하고 다음 정보를 입력하세요:
```env
MISSKEY_API_URL=https://your-instance.example.com/api
MISSKEY_TOKEN=your-api-token


docker run -d --name rolebot --env-file .env rolebot
