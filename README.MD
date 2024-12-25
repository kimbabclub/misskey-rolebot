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
## 🔑 준비물

봇을 작동하기 위해 아래의 준비물이 필요합니다: 

- 모더레이터 이상의 권한이 있는 계정에서 생성한 API (아래를 참고해주세요)
- 부여하고자 하는 역할의 id

---

## 🔑 API에서 필요한 권한

봇을 정상적으로 작동시키려면 Misskey API에서 다음 권한이 필요합니다:

- 계정의 정보를 봅니다
- 대화를 읽습니다
- 대화를 시작하거나 메시지를 보냅니다
- 노트를 작성하거나 삭제합니다
- 알림을 확인합니다
- 역할 수정하기
- 역할 보기

---

## 🚀 Docker로 돌리는 법

이 봇은 Docker 환경에서 손쉽게 실행할 수 있습니다.

### 1️⃣ 레포 불러오기
도커가 설치된 서버에 레포를 클론하고, 디렉토리로 이동하세요.
```
git clone https://github.com/kimbabclub/misskey-rolebot.git
cd misskey-rolebot
```

### 2️⃣ `.env` 파일 설정
프로젝트 루트에 `.env` 파일을 작성하고 다음 정보를 입력하세요:
```
MISSKEY_API_URL=https://your-instance.example.com/api
MISSKEY_TOKEN=your-api-token
MISSKEY_ROLE_ID=roleid
```
### 3️⃣ 빌드 및 컨테이너 실행
작성된 내용을 바탕으로 이미지를 빌드하고 실행하면 끝!
```
docker build -t misskey-rolebot .
docker run -d --name misskey-rolebot --env-file .env misskey-rolebot
```
