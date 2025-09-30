import { io } from "socket.io-client";

// 기본 API 주소 (이미 쓰고 있을 거예요)
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050/api";
const ORIGIN = API_BASE.replace(/\/api$/, ""); // → http://localhost:5050 or https://petwebapp.herokuapp.com

// 개발/배포 환경 분기
const DEV = process.env.NODE_ENV !== "production";

// 우선순위: NEXT_PUBLIC_WS_URL > (로컬/배포 자동 분기)
const SOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL || (DEV ? "http://localhost:5050" : ORIGIN);

export const socket = io(SOCKET_URL, {
  path: "/socket.io",        // 서버와 동일해야 함
  autoConnect: false,        // 로그인/페이지 진입 시 수동 connect()
  withCredentials: true,
  transports: ["websocket"], // polling 방지
});
