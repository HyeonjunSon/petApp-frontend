import { io } from "socket.io-client";

export const socket = io(
  process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5050",
  {
    path: "/socket.io",       // 서버와 동일해야 함
    autoConnect: false,       // 수동 connect()
    withCredentials: true,    // 쿠키 인증 쓰면 true
    transports: ["websocket"] // polling 404 회피(옵션)
  }
);