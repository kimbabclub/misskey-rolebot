# Node.js LTS 버전을 기반 이미지로 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 종속성 파일 복사
COPY package.json package-lock.json ./

# 종속성 설치
RUN npm install

# 애플리케이션 파일 복사
COPY . .

# 환경 변수 파일 추가 (선택적으로 .env 복사)
COPY .env .env

# 컨테이너 실행 시 명령어
CMD ["node", "bot.js"]
