"use client";

import { useEffect, useState, useCallback } from "react";

const KEY = "petdate:locale";
export type Locale = "en" | "ko";

type Entry = { en: string; ko: string };

const DICT: Record<string, Entry> = {
  // sidebar / nav
  "nav.home": { en: "Home", ko: "홈" },
  "nav.discover": { en: "Discover", ko: "찾기" },
  "nav.walks": { en: "Walks", ko: "산책" },
  "nav.chat": { en: "Chat", ko: "채팅" },
  "nav.profile": { en: "Profile", ko: "프로필" },
  "sidebar.logout": { en: "Log out", ko: "로그아웃" },
  "sidebar.loggingOut": { en: "Logging out…", ko: "로그아웃 중…" },
  "sidebar.dark": { en: "Dark", ko: "다크" },
  "sidebar.light": { en: "Light", ko: "라이트" },
  "sidebar.language": { en: "Language", ko: "언어" },
  "sidebar.theme": { en: "Theme", ko: "테마" },

  // common
  "common.user": { en: "User", ko: "사용자" },
  "common.loading": { en: "Loading…", ko: "불러오는 중…" },
  "common.viewAll": { en: "View all ›", ko: "전체 보기 ›" },

  // dashboard
  "dash.greeting": { en: "Hello, {name} 👋", ko: "안녕하세요, {name} 👋" },
  "dash.subtitle": {
    en: "Have a happy day with your pet.",
    ko: "오늘도 반려동물과 행복한 하루 보내세요.",
  },
  "dash.completion": { en: "Profile completion", ko: "프로필 완성도" },
  "dash.upcomingWalks": { en: "Upcoming walks", ko: "다가오는 산책 약속" },
  "dash.noUpcoming": {
    en: "No upcoming walks. Match someone and plan a walk!",
    ko: "다가오는 산책 약속이 없어요. 매칭 후 약속을 잡아보세요!",
  },
  "dash.newMatches": { en: "New matches", ko: "새 매칭" },
  "dash.unread": { en: "Unread messages", ko: "안 읽은 메시지" },
  "dash.stepsToday": { en: "Steps today", ko: "오늘 걸음수" },
  "dash.stepsFromPhone": { en: "From your phone", ko: "폰에서 자동 동기화" },
  "dash.quickActions": { en: "Quick actions", ko: "바로가기" },
  "dash.startMatching": { en: "Start matching", ko: "매칭 시작" },
  "dash.findFriends": { en: "Find new friends", ko: "새 친구 찾기" },
  "dash.continueChat": { en: "Continue chatting", ko: "대화 이어가기" },
  "dash.uploadPhotos": { en: "Upload photos", ko: "사진 업로드" },
  "dash.saveMemories": { en: "Save memories", ko: "추억 저장" },
  "dash.myPets": { en: "My pets", ko: "내 펫" },
  "dash.manageProfile": { en: "Manage profile", ko: "프로필 관리" },
  "dash.settingsAlerts": { en: "Matching · Alerts", ko: "매칭 · 알림" },
  "dash.noPets": { en: "No pets yet", ko: "아직 등록한 펫이 없어요" },
  "dash.registerPrompt": {
    en: "Register your pet to start matching.",
    ko: "우리 아이를 등록하면 매칭을 시작할 수 있어요.",
  },
  "dash.addPet": { en: "Add a pet", ko: "펫 추가하기" },
  "dash.somethingWrong": { en: "Something went wrong", ko: "문제가 발생했어요" },
  "dash.couldntLoad": {
    en: "Couldn't load user info.",
    ko: "사용자 정보를 불러오지 못했어요.",
  },
  "dash.goLogin": { en: "Go to login", ko: "로그인으로 이동" },
  "dash.checking": { en: "Checking authentication…", ko: "인증 확인 중…" },
  "dash.ageUnknown": { en: "Age unknown", ko: "나이 미상" },
  "dash.other": { en: "Other", ko: "기타" },
  "dash.last7days": { en: "Last 7 days", ko: "최근 7일" },
  "dash.completionHint.photo": {
    en: "Add your photo to reach 100%.",
    ko: "프로필 사진을 추가하면 100%가 돼요.",
  },
  "dash.completionHint.location": {
    en: "Add your neighborhood to reach 100%.",
    ko: "동네를 추가하면 100%가 돼요.",
  },
  "dash.completionHint.about": {
    en: "Add an about-you line to reach 100%.",
    ko: "한 줄 소개를 추가하면 100%가 돼요.",
  },
  "dash.completionHint.pet": {
    en: "Add a pet with photo to reach 100%.",
    ko: "사진이 있는 펫을 추가하면 100%가 돼요.",
  },
  "dash.placeTBD": { en: "Place TBD", ko: "장소 미정" },

  // match / discover
  "match.empty.title": {
    en: "No new friends nearby",
    ko: "근처에 새로운 친구가 없어요",
  },
  "match.empty.desc": {
    en: "Try again later or widen your radius in settings.",
    ko: "잠시 후 다시 시도하거나 설정에서 반경을 넓혀보세요.",
  },
  "match.empty.expand": { en: "Expand radius", ko: "반경 넓히기" },
  "match.error.title": {
    en: "Something went wrong",
    ko: "문제가 발생했어요",
  },
  "match.retry": { en: "Try again", ko: "다시 시도" },
  "match.detail": { en: "Profile", ko: "프로필" },
  "match.report": { en: "Report", ko: "신고" },
  "match.close": { en: "Close", ko: "닫기" },
  "match.with": { en: "with", ko: "보호자" },
  "match.verified": { en: "Verified", ko: "인증" },
  "match.success.kicker": { en: "It's a match", ko: "매칭 성공" },
  "match.success.title": {
    en: "You're walking buddies!",
    ko: "산책 메이트가 됐어요!",
  },
  "match.success.send": { en: "Send a message", ko: "메시지 보내기" },
  "match.success.continue": { en: "Keep browsing", ko: "계속 둘러보기" },
  "match.toast.liked": { en: "Liked {name}", ko: "{name}에게 좋아요" },
  "match.toast.likeFail": {
    en: "Couldn't like, try again.",
    ko: "좋아요 실패, 다시 시도하세요.",
  },
  "match.goal.dating": { en: "Dating", ko: "데이트" },
  "match.goal.friends": { en: "Friends", ko: "친구" },
  "match.goal.both": { en: "Both", ko: "둘 다" },
  "match.size.s": { en: "S", ko: "소형" },
  "match.size.m": { en: "M", ko: "중형" },
  "match.size.l": { en: "L", ko: "대형" },
  "match.aria.prevPhoto": { en: "Previous photo", ko: "이전 사진" },
  "match.aria.nextPhoto": { en: "Next photo", ko: "다음 사진" },
  "match.aria.openDetail": { en: "Open detail", ko: "상세 보기" },
  "match.aria.pass": { en: "Pass", ko: "패스" },
  "match.aria.like": { en: "Like", ko: "좋아요" },

  // chat
  "chat.title": { en: "Chats", ko: "채팅" },
  "chat.empty.list.title": { en: "No chats yet", ko: "아직 채팅이 없어요" },
  "chat.empty.list.desc": {
    en: "When you match, conversations show up here.",
    ko: "매칭되면 여기에 대화가 표시돼요.",
  },
  "chat.empty.pick.title": {
    en: "Pick a conversation",
    ko: "대화를 선택하세요",
  },
  "chat.empty.pick.desc": {
    en: "Your matches show up on the left.",
    ko: "왼쪽에 매칭된 상대가 표시돼요.",
  },
  "chat.placeholder": { en: "Type a message", ko: "메시지를 입력하세요" },
  "chat.send": { en: "Send", ko: "보내기" },
  "chat.read": { en: "Read", ko: "읽음" },
  "chat.sayHi": { en: "Say hi!", ko: "인사를 보내보세요!" },
  "chat.planWalk": { en: "Plan a walk", ko: "산책 약속 잡기" },
  "chat.aria.back": { en: "Back", ko: "뒤로" },
  "chat.err.load": {
    en: "Couldn't load conversation.",
    ko: "대화를 불러오지 못했어요.",
  },
  "chat.err.invite": {
    en: "Couldn't update invite.",
    ko: "초대를 업데이트하지 못했어요.",
  },
  "chat.err.send": {
    en: "Couldn't send invite.",
    ko: "초대를 보내지 못했어요.",
  },

  // walk invite
  "invite.title": { en: "Walk invite", ko: "산책 약속" },
  "invite.status.proposed": { en: "Proposed", ko: "제안됨" },
  "invite.status.confirmed": { en: "Confirmed", ko: "확정" },
  "invite.status.declined": { en: "Declined", ko: "거절" },
  "invite.status.cancelled": { en: "Cancelled", ko: "취소" },
  "invite.btn.accept": { en: "Accept", ko: "수락" },
  "invite.btn.decline": { en: "Decline", ko: "거절" },
  "invite.btn.cancel": { en: "Cancel", ko: "취소" },
  "invite.btn.send": { en: "Send invite", ko: "초대 보내기" },
  "invite.field.date": { en: "Date", ko: "날짜" },
  "invite.field.time": { en: "Time", ko: "시간" },
  "invite.field.place": { en: "Place", ko: "장소" },
  "invite.field.place.ph": {
    en: "Park name, intersection, etc.",
    ko: "공원, 교차로 등",
  },
  "invite.field.note": { en: "Note", ko: "메모" },
  "invite.field.note.ph": {
    en: "Anything they should know?",
    ko: "전달할 내용이 있나요?",
  },
  "common.cancel": { en: "Cancel", ko: "취소" },
  "common.delete": { en: "Delete", ko: "삭제" },
  "common.save": { en: "Save", ko: "저장" },
  "common.back": { en: "Back", ko: "뒤로" },

  // walks
  "walks.title": { en: "Walks", ko: "산책" },
  "walks.upcoming": { en: "Upcoming", ko: "다가오는 산책" },
  "walks.noUpcoming": {
    en: "No confirmed walks. Plan one from a chat.",
    ko: "확정된 산책이 없어요. 채팅에서 약속을 잡아보세요.",
  },
  "walks.planFromChat": { en: "Plan a walk ›", ko: "약속 잡기 ›" },
  "walks.stat.distance": { en: "Distance today", ko: "오늘 거리" },
  "walks.stat.time": { en: "Time today", ko: "오늘 시간" },
  "walks.stat.count": { en: "Walks today", ko: "오늘 횟수" },
  "walks.filter": { en: "Filter", ko: "필터" },
  "walks.allPets": { en: "All pets", ko: "전체 펫" },
  "walks.period.week": { en: "This week", ko: "이번 주" },
  "walks.period.month": { en: "This month", ko: "이번 달" },
  "walks.period.custom": { en: "Custom", ko: "직접 지정" },
  "walks.field.from": { en: "From", ko: "시작" },
  "walks.field.to": { en: "To", ko: "종료" },
  "walks.records": { en: "Records", ko: "기록" },
  "walks.empty.title": {
    en: "No walks in this range",
    ko: "이 기간에 산책 기록이 없어요",
  },
  "walks.empty.desc": {
    en: "Log a walk or change the filter.",
    ko: "산책을 기록하거나 필터를 바꿔보세요.",
  },
  "walks.log": { en: "Log a walk", ko: "산책 기록하기" },
  "walks.confirmDelete": { en: "Delete this walk?", ko: "이 산책을 삭제할까요?" },
  "walks.toast.deleted": { en: "Walk deleted", ko: "산책 삭제됨" },
  "walks.err.delete": { en: "Couldn't delete", ko: "삭제 실패" },

  // walks/new
  "walks.new.title": { en: "Log a walk", ko: "산책 기록" },
  "walks.new.details": { en: "Details", ko: "상세" },
  "walks.field.pet": { en: "Pet", ko: "펫" },
  "walks.field.distance": { en: "Distance (km)", ko: "거리 (km)" },
  "walks.field.duration": { en: "Duration (min)", ko: "시간 (분)" },
  "walks.field.started": { en: "Started", ko: "시작" },
  "walks.field.ended": { en: "Ended", ko: "종료" },
  "walks.field.notes": { en: "Notes", ko: "메모" },
  "walks.field.notes.ph": { en: "How did it go?", ko: "어떻게 다녀왔나요?" },
  "walks.new.noPets": { en: "Add a pet first.", ko: "먼저 펫을 추가하세요." },
  "walks.new.addPet": { en: "Add pet", ko: "펫 추가" },
  "walks.new.save": { en: "Save walk", ko: "기록 저장" },
  "walks.err.petRequired": { en: "Choose a pet.", ko: "펫을 선택하세요." },
  "walks.err.distance": {
    en: "Distance must be greater than 0.",
    ko: "거리는 0보다 커야 해요.",
  },
  "walks.err.duration": {
    en: "Duration must be greater than 0.",
    ko: "시간은 0보다 커야 해요.",
  },
  "walks.err.save": { en: "Couldn't save the walk.", ko: "산책 저장 실패." },

  // profile
  "profile.aria.changePhoto": { en: "Change photo", ko: "사진 변경" },
  "profile.addLocation": { en: "Add neighborhood", ko: "동네 추가" },
  "profile.section.about": { en: "About you", ko: "내 정보" },
  "profile.field.neighborhood": { en: "Neighborhood", ko: "동네" },
  "profile.field.neighborhood.ph": { en: "e.g. Itaewon", ko: "예: 이태원" },
  "profile.field.lookingFor": { en: "Looking for", ko: "찾는 사람" },
  "profile.field.about": { en: "About", ko: "한 줄 소개" },
  "profile.field.about.ph": {
    en: "One line about you and your pet.",
    ko: "나와 우리 펫에 대한 한 줄.",
  },
  "profile.field.interests": { en: "Interests", ko: "관심사" },
  "profile.interests.hint": {
    en: "Up to 5 · {n}/5 picked",
    ko: "최대 5개 · {n}/5 선택",
  },
  "profile.section.pets": { en: "My pets", ko: "내 펫" },
  "profile.addPet": { en: "+ Add pet", ko: "+ 펫 추가" },
  "profile.noPets": {
    en: "You haven't added a pet yet.",
    ko: "아직 추가한 펫이 없어요.",
  },
  "profile.section.more": { en: "More", ko: "더 보기" },
  "profile.link.photos": { en: "Photos", ko: "사진" },
  "profile.link.safety": { en: "Safety", ko: "안전" },
  "profile.link.settings": { en: "Settings", ko: "설정" },
  "profile.link.membership": { en: "Membership", ko: "멤버십" },
  "profile.link.membership.hint": { en: "Coming soon", ko: "준비 중" },
  "profile.link.logout": { en: "Log out", ko: "로그아웃" },
  "profile.link.loggingOut": { en: "Logging out…", ko: "로그아웃 중…" },
  "profile.toast.saved": { en: "Saved", ko: "저장됨" },
  "profile.toast.photoUpdated": { en: "Photo updated", ko: "사진 업데이트됨" },
  "profile.err.save": { en: "Couldn't save", ko: "저장 실패" },
  "profile.err.upload": { en: "Upload failed", ko: "업로드 실패" },
  "match.goal.dating.full": { en: "Dating", ko: "데이트" },

  // settings
  "settings.title": { en: "Settings", ko: "설정" },
  "settings.section.matching": { en: "Matching", ko: "매칭" },
  "settings.field.distance": { en: "Max distance", ko: "최대 거리" },
  "settings.distance.km": { en: "{n} km", ko: "{n} km" },
  "settings.field.species": { en: "Species", ko: "종" },
  "settings.field.species.hint": {
    en: "What kind of pets to show.",
    ko: "어떤 종류의 펫을 보여줄까요?",
  },
  "settings.species.all": { en: "All", ko: "전체" },
  "settings.species.dog": { en: "Dogs", ko: "개" },
  "settings.species.cat": { en: "Cats", ko: "고양이" },
  "settings.toggle.discoverable": {
    en: "Discoverable — let others see me",
    ko: "탐색 허용 — 다른 사용자에게 노출",
  },
  "settings.toggle.push": {
    en: "Push notifications",
    ko: "푸시 알림",
  },
  "settings.section.appearance": { en: "Appearance", ko: "외관" },
  "settings.theme.light": { en: "Light", ko: "라이트" },
  "settings.theme.dark": { en: "Dark", ko: "다크" },
  "settings.theme.system": { en: "System", ko: "시스템" },
  "settings.section.language": { en: "Language", ko: "언어" },
  "settings.section.password": { en: "Password", ko: "비밀번호" },
  "settings.change.password": { en: "Change password", ko: "비밀번호 변경" },
  "settings.section.account": { en: "Account", ko: "계정" },
  "settings.delete.account": { en: "Delete account", ko: "계정 삭제" },
  "settings.pw.current": { en: "Current password", ko: "현재 비밀번호" },
  "settings.pw.new": { en: "New password", ko: "새 비밀번호" },
  "settings.pw.confirm": { en: "Confirm new password", ko: "새 비밀번호 확인" },
  "settings.pw.update": { en: "Update", ko: "변경" },
  "settings.pw.mismatch": { en: "Passwords don't match.", ko: "비밀번호가 일치하지 않아요." },
  "settings.pw.tooShort": {
    en: "Use at least 8 characters.",
    ko: "8자 이상으로 설정하세요.",
  },
  "settings.pw.err": {
    en: "Couldn't update password.",
    ko: "비밀번호 변경 실패.",
  },
  "settings.del.warn": {
    en: "This permanently deletes your account, pets, and chats. This can't be undone.",
    ko: "계정·펫·채팅이 영구 삭제됩니다. 되돌릴 수 없어요.",
  },
  "settings.del.confirmLabel": {
    en: 'Type "DELETE" to confirm',
    ko: '"DELETE"를 입력해서 확인',
  },
  "settings.del.confirmErr": {
    en: 'Type "DELETE" to confirm.',
    ko: '"DELETE"를 입력해서 확인하세요.',
  },
  "settings.del.go": { en: "Delete forever", ko: "영구 삭제" },
  "settings.del.err": {
    en: "Couldn't delete account.",
    ko: "계정 삭제 실패.",
  },
  "settings.toast.saved": { en: "Saved", ko: "저장됨" },
  "settings.toast.pwUpdated": { en: "Password updated", ko: "비밀번호 변경됨" },
  "settings.err.save": { en: "Couldn't save", ko: "저장 실패" },

  // safety
  "safety.title": { en: "Safety", ko: "안전" },
  "safety.blocks.title": { en: "Blocked users", ko: "차단 목록" },
  "safety.userId.ph": { en: "User id", ko: "유저 ID" },
  "safety.block": { en: "Block", ko: "차단" },
  "safety.unblock": { en: "Unblock", ko: "해제" },
  "safety.noBlocks": { en: "No one is blocked.", ko: "차단된 사용자가 없어요." },
  "safety.confirmBlock": { en: "Block user {id}?", ko: "{id} 사용자를 차단할까요?" },
  "safety.confirmUnblock": { en: "Unblock this user?", ko: "이 사용자를 차단 해제할까요?" },
  "safety.toast.blocked": { en: "User blocked", ko: "사용자 차단됨" },
  "safety.toast.unblocked": { en: "User unblocked", ko: "사용자 차단 해제됨" },
  "safety.err.block": { en: "Couldn't block", ko: "차단 실패" },
  "safety.err.unblock": { en: "Couldn't unblock", ko: "차단 해제 실패" },
  "safety.report.title": { en: "Report a user", ko: "사용자 신고" },
  "safety.field.target": { en: "User id", ko: "유저 ID" },
  "safety.field.target.ph": {
    en: "The user you're reporting",
    ko: "신고할 사용자",
  },
  "safety.field.category": { en: "Category", ko: "카테고리" },
  "safety.field.reason": { en: "Reason", ko: "사유" },
  "safety.field.reason.ph": { en: "What happened?", ko: "무슨 일이 있었나요?" },
  "safety.field.evidence": { en: "Evidence", ko: "증빙" },
  "safety.field.evidence.hint": {
    en: "Image / video / audio · max 25MB each, 20 files.",
    ko: "이미지/비디오/오디오 · 각 25MB, 20개까지.",
  },
  "safety.drop": { en: "Tap or drop files here", ko: "탭하거나 파일을 끌어다 놓으세요" },
  "safety.attached": {
    en: "{n} file{s} attached",
    ko: "{n}개 파일 첨부됨",
  },
  "safety.submit": { en: "Submit report", ko: "신고 보내기" },
  "safety.err.targetReq": {
    en: "Please enter the user id.",
    ko: "유저 ID를 입력하세요.",
  },
  "safety.err.reasonReq": {
    en: "Please write a reason.",
    ko: "사유를 입력하세요.",
  },
  "safety.err.upload": { en: "Only image / video / audio are allowed.", ko: "이미지/비디오/오디오만 허용돼요." },
  "safety.err.tooLarge": { en: "File too large (max 25MB).", ko: "파일이 너무 커요 (최대 25MB)." },
  "safety.err.submit": {
    en: "Couldn't submit report.",
    ko: "신고 전송 실패.",
  },
  "safety.toast.submitted": { en: "Report received", ko: "신고 접수됨" },
  "safety.mine.title": { en: "My reports", ko: "내 신고 내역" },
  "safety.mine.none": {
    en: "You haven't submitted any reports.",
    ko: "신고 내역이 없어요.",
  },
  "safety.status.received": { en: "received", ko: "접수" },
  "safety.status.reviewing": { en: "reviewing", ko: "검토 중" },
  "safety.status.resolved": { en: "resolved", ko: "처리 완료" },
  "safety.cat.spam": { en: "Spam/Ads", ko: "스팸/광고" },
  "safety.cat.hate": { en: "Hate/Harassment", ko: "혐오/괴롭힘" },
  "safety.cat.sexual": { en: "Sexual/Explicit", ko: "성적/노골적" },
  "safety.cat.scam": { en: "Scam/Money request", ko: "사기/금전 요구" },
  "safety.cat.stalking": { en: "Stalking/Threats", ko: "스토킹/위협" },
  "safety.cat.other": { en: "Other", ko: "기타" },

  // onboarding
  "onb.step": { en: "Step {n} of {total}", ko: "{n} / {total} 단계" },
  "onb.step1.title": { en: "Tell us about you.", ko: "본인 소개" },
  "onb.step1.sub": {
    en: "A photo, your neighborhood, and what you're looking for.",
    ko: "사진, 동네, 찾는 사람.",
  },
  "onb.step2.title": { en: "Now your pet.", ko: "이제 펫 차례" },
  "onb.step2.sub": {
    en: "Optional but recommended — pets without photos won't be shown.",
    ko: "선택이지만 권장 — 사진 없는 펫은 노출되지 않아요.",
  },
  "onb.step3.title": { en: "What do you enjoy?", ko: "관심사" },
  "onb.step3.sub": {
    en: "Pick up to 5 to help us suggest better matches.",
    ko: "더 나은 매칭을 위해 최대 5개를 선택하세요.",
  },
  "onb.field.photo": { en: "Your photo", ko: "프로필 사진" },
  "onb.btn.replace": { en: "Replace", ko: "교체" },
  "onb.btn.upload": { en: "Upload", ko: "업로드" },
  "onb.skip": { en: "Skip for now", ko: "건너뛰기" },
  "onb.next": { en: "Next", ko: "다음" },
  "onb.finish": { en: "Finish", ko: "완료" },
  "onb.interestsHint": {
    en: "You can skip this and add it later from Settings.",
    ko: "지금 건너뛰고 나중에 설정에서 추가할 수 있어요.",
  },
  "onb.picked": { en: "Pick up to {max}", ko: "최대 {max}개 선택" },

  // pet (form + pet routes)
  "pet.field.photo": { en: "Photo", ko: "사진" },
  "pet.field.name": { en: "Name", ko: "이름" },
  "pet.field.name.ph": { en: "e.g. Bori", ko: "예: 보리" },
  "pet.field.type": { en: "Type", ko: "종류" },
  "pet.type.dog": { en: "Dog", ko: "강아지" },
  "pet.type.cat": { en: "Cat", ko: "고양이" },
  "pet.type.other": { en: "Other", ko: "기타" },
  "pet.field.breed": { en: "Breed", ko: "품종" },
  "pet.field.breed.ph": { en: "e.g. Maltese", ko: "예: 말티즈" },
  "pet.field.age": { en: "Age", ko: "나이" },
  "pet.field.age.ph": { en: "years", ko: "세" },
  "pet.field.sex": { en: "Sex", ko: "성별" },
  "pet.sex.unknown": { en: "Unknown", ko: "미상" },
  "pet.sex.male": { en: "Male", ko: "수컷" },
  "pet.sex.female": { en: "Female", ko: "암컷" },
  "pet.field.size": { en: "Size", ko: "크기" },
  "pet.size.s": { en: "Small", ko: "소형" },
  "pet.size.m": { en: "Medium", ko: "중형" },
  "pet.size.l": { en: "Large", ko: "대형" },
  "pet.field.personality": { en: "Personality", ko: "성격" },
  "pet.field.about": { en: "About", ko: "한 줄 소개" },
  "pet.field.about.ph": {
    en: "One line about your pet.",
    ko: "우리 펫에 대한 한 줄.",
  },
  "pet.temp.calm": { en: "Calm", ko: "차분" },
  "pet.temp.energetic": { en: "Energetic", ko: "활발" },
  "pet.temp.friendly": { en: "Friendly", ko: "친근" },
  "pet.temp.shy": { en: "Shy", ko: "수줍음" },
  "pet.temp.curious": { en: "Curious", ko: "호기심" },
  "pet.temp.playful": { en: "Playful", ko: "장난기" },
  "pet.temp.protective": { en: "Protective", ko: "보호적" },
  "pet.temp.independent": { en: "Independent", ko: "독립적" },
  "pet.new.title": { en: "Add a pet", ko: "펫 추가" },
  "pet.new.create": { en: "Create", ko: "만들기" },
  "pet.edit.title": { en: "Edit {name}", ko: "{name} 편집" },
  "pet.edit.titleGeneric": { en: "Edit pet", ko: "펫 편집" },
  "pet.edit.confirmDelete": {
    en: "Delete {name}?",
    ko: "{name}을(를) 삭제할까요?",
  },
  "pet.err.create": { en: "Couldn't create pet.", ko: "펫 추가 실패." },
  "pet.err.save": { en: "Couldn't save changes.", ko: "변경사항 저장 실패." },
  "pet.err.delete": { en: "Couldn't delete pet.", ko: "펫 삭제 실패." },
  "pet.err.load": { en: "Couldn't load pet.", ko: "펫 정보를 불러오지 못했어요." },
  "pet.details": { en: "Pet details", ko: "펫 상세" },

  // photos
  "photos.title": { en: "Photos", ko: "사진" },
  "photos.upload": { en: "Upload", ko: "업로드" },
  "photos.section.upload": { en: "Upload", ko: "업로드" },
  "photos.drop": {
    en: "Drop an image here, or tap to choose.",
    ko: "이미지를 드롭하거나 탭하여 선택.",
  },
  "photos.formats": {
    en: "png · jpg · webp · max 10MB",
    ko: "png · jpg · webp · 최대 10MB",
  },
  "photos.count": { en: "{n} photos", ko: "사진 {n}장" },
  "photos.loading": { en: "Loading…", ko: "불러오는 중…" },
  "photos.empty.title": { en: "No photos yet", ko: "아직 사진이 없어요" },
  "photos.empty.desc": {
    en: "Upload memories of your pets and walks.",
    ko: "펫과 산책 추억을 업로드해보세요.",
  },
  "photos.preview": { en: "Photo", ko: "사진" },
  "photos.confirmDelete": { en: "Delete this photo?", ko: "이 사진을 삭제할까요?" },
  "photos.toast.uploaded": { en: "Uploaded", ko: "업로드 완료" },
  "photos.toast.deleted": { en: "Deleted", ko: "삭제됨" },
  "photos.err.uploadType": {
    en: "Only image files are allowed.",
    ko: "이미지 파일만 가능해요.",
  },
  "photos.err.uploadSize": {
    en: "File too large (max 10MB).",
    ko: "파일이 너무 커요 (최대 10MB).",
  },
  "photos.err.upload": { en: "Upload failed.", ko: "업로드 실패." },
  "photos.err.delete": { en: "Couldn't delete", ko: "삭제 실패" },

  // landing
  "land.nav.features": { en: "Features", ko: "기능" },
  "land.nav.how": { en: "How it works", ko: "이용 방법" },
  "land.nav.reviews": { en: "Reviews", ko: "후기" },
  "land.nav.login": { en: "Log in", ko: "로그인" },
  "land.nav.start": { en: "Get started", ko: "시작하기" },
  "land.hero.kicker": {
    en: "Pet-first dating, near you",
    ko: "펫 우선 데이트, 가까이에서",
  },
  "land.hero.title.1": { en: "Meet your pet's", ko: "우리 펫의" },
  "land.hero.title.2": { en: "next best friend.", ko: "단짝을 찾아주세요." },
  "land.hero.sub": {
    en: "Match with people nearby whose pets get along with yours, then plan real walks — not just chats. Verified neighbors, simple safety tools, no clutter.",
    ko: "동네에서 우리 펫과 잘 맞는 이웃을 매칭하고, 채팅만이 아니라 실제 산책 약속을 잡아요. 인증된 이웃, 간단한 안전 도구.",
  },
  "land.hero.cta": { en: "Get started", ko: "시작하기" },
  "land.hero.see": { en: "See how it works", ko: "이용 방법 보기" },
  "land.hero.note": {
    en: "Free to start · No card required",
    ko: "무료로 시작 · 카드 등록 불필요",
  },
  "land.stat.1.title": {
    en: "Neighborhood-based",
    ko: "동네 단위",
  },
  "land.stat.1.desc": {
    en: "Within walking distance, not airports apart.",
    ko: "걸어서 만날 수 있는 거리.",
  },
  "land.stat.2.title": { en: "Meet, then log", ko: "약속 → 기록" },
  "land.stat.2.desc": {
    en: "Plan walks, track steps, keep memories.",
    ko: "산책 약속, 걸음수, 추억까지.",
  },
  "land.stat.3.title": { en: "Verified · Safe", ko: "인증 · 안전" },
  "land.stat.3.desc": {
    en: "Email verification, easy block & report.",
    ko: "이메일 인증, 간편한 차단·신고.",
  },
  "land.feat.kicker": { en: "Features", ko: "기능" },
  "land.feat.title": { en: "Built around the walk", ko: "산책을 중심으로" },
  "land.feat.sub": {
    en: "Three things we focus on — and a lot of things we left out.",
    ko: "이 세 가지에 집중했고, 나머지는 덜어냈어요.",
  },
  "land.feat.1.title": { en: "Pet-first profiles", ko: "펫 우선 프로필" },
  "land.feat.1.desc": {
    en: "Lead with your pet's photo, breed and personality. Owner second.",
    ko: "사진·품종·성격이 먼저. 보호자는 그 다음.",
  },
  "land.feat.2.title": { en: "Walk meetups", ko: "산책 약속" },
  "land.feat.2.desc": {
    en: "Pick a date, time, and place. Confirm and you're set.",
    ko: "날짜·시간·장소를 정하고 확정.",
  },
  "land.feat.3.title": { en: "Auto step tracking", ko: "자동 걸음수" },
  "land.feat.3.desc": {
    en: "Steps sync from your phone — no manual logging.",
    ko: "휴대폰에서 자동 동기 — 수동 입력 없음.",
  },
  "land.how.kicker": { en: "How it works", ko: "이용 방법" },
  "land.how.title": {
    en: "Three steps. No more, no less.",
    ko: "딱 3단계.",
  },
  "land.how.1.title": { en: "Add your pet", ko: "우리 펫 등록" },
  "land.how.1.desc": {
    en: "Photos, breed, age, and a short personality note.",
    ko: "사진, 품종, 나이, 짧은 성격 메모.",
  },
  "land.how.2.title": { en: "Find matches nearby", ko: "동네 매칭" },
  "land.how.2.desc": {
    en: "Swipe through pets in your neighborhood.",
    ko: "근처 펫을 스와이프해서 찾기.",
  },
  "land.how.3.title": { en: "Plan a real walk", ko: "실제 산책 약속" },
  "land.how.3.desc": {
    en: "Pick a time and park. Meet outside, not in DMs.",
    ko: "시간·공원을 정하고 직접 만나요.",
  },
  "land.reviews.kicker": { en: "Reviews", ko: "후기" },
  "land.reviews.title": {
    en: "From people who actually walked.",
    ko: "실제로 산책한 사람들의 말.",
  },
  "land.reviews.1": {
    en: "We matched with a neighbor on Monday. Bori and Coco walked together on Saturday. That's the whole point.",
    ko: "월요일에 매칭하고 토요일에 보리랑 코코가 함께 산책했어요. 딱 그게 포인트죠.",
  },
  "land.reviews.1.by": { en: "Sarah · with Bori", ko: "Sarah · 보리와 함께" },
  "land.reviews.2": {
    en: "The pet-first card feels right. I knew about the dog before I knew about the owner — exactly how it should be.",
    ko: "펫 우선 카드가 마음에 들어요. 보호자보다 강아지가 먼저 보여요.",
  },
  "land.reviews.2.by": { en: "James · with Mochi", ko: "James · 모찌와 함께" },
  "land.reviews.3": {
    en: "Quiet, no spam, easy to block. The walks happen in the real world, not in inbox land.",
    ko: "조용하고 스팸 없고 차단도 쉬워요. 실제 산책으로 이어져요.",
  },
  "land.reviews.3.by": { en: "Min · with Bbang", ko: "Min · 빵이와 함께" },
  "land.cta.title": {
    en: "Get out there with your pet.",
    ko: "이제 우리 펫과 밖으로.",
  },
  "land.cta.sub": {
    en: "Free to start — your first match takes about a minute.",
    ko: "무료로 시작 — 첫 매칭까지 1분.",
  },
  "land.footer.terms": { en: "Terms", ko: "이용약관" },
  "land.footer.privacy": { en: "Privacy", ko: "개인정보" },
  "land.footer.content": { en: "Content policy", ko: "콘텐츠 정책" },

  // brand (used by login brand panel + landing)
  "brand.tagline.1": { en: "Match your pet.", ko: "펫과 매칭하고" },
  "brand.tagline.2": { en: "Meet your neighbor.", ko: "이웃을 만나세요." },
  "brand.tagline.sub": {
    en: "Find walking buddies nearby, plan real meetups, and skip the inbox-only chats.",
    ko: "동네 산책 친구를 찾고, 실제 만남을 약속하고, 채팅으로만 끝나지 않게.",
  },
  "brand.bullet.1": {
    en: "Neighborhood-based, walking distance",
    ko: "동네 단위 · 걸어서 갈 만한 거리",
  },
  "brand.bullet.2": {
    en: "Verified emails, easy block & report",
    ko: "이메일 인증 · 손쉬운 차단과 신고",
  },
  "brand.bullet.3": {
    en: "Plan walks, auto-track steps",
    ko: "산책 약속 · 걸음수 자동 동기",
  },

  // auth
  "auth.tab.login": { en: "Log in", ko: "로그인" },
  "auth.tab.signup": { en: "Sign up", ko: "가입" },
  "auth.welcome.title": { en: "Welcome back.", ko: "다시 만나서 반가워요." },
  "auth.welcome.sub": {
    en: "Log in to keep meeting walking buddies.",
    ko: "로그인하고 산책 메이트를 계속 만나보세요.",
  },
  "auth.signup1.title": { en: "Create your account.", ko: "계정 만들기" },
  "auth.signup1.sub": {
    en: "We'll send a 6-digit code to verify your email.",
    ko: "이메일로 6자리 인증 코드를 보냅니다.",
  },
  "auth.signup2.title": { en: "Check your email.", ko: "메일을 확인하세요." },
  "auth.signup2.sub": {
    en: "Enter the code we sent to {email}.",
    ko: "{email}로 보낸 코드를 입력하세요.",
  },
  "auth.signup3.title": { en: "Finish setting up.", ko: "마무리할게요." },
  "auth.signup3.sub": {
    en: "Almost done — pick a name and password.",
    ko: "이름과 비밀번호만 정하면 끝.",
  },
  "auth.forgot1.title": { en: "Reset your password.", ko: "비밀번호 재설정" },
  "auth.forgot1.sub": {
    en: "Enter your account email to get a reset code.",
    ko: "계정 이메일을 입력하면 재설정 코드를 보냅니다.",
  },
  "auth.forgot2.title": { en: "Set a new password.", ko: "새 비밀번호" },
  "auth.forgot2.sub": {
    en: "Enter the code and choose a new password.",
    ko: "코드를 입력하고 새 비밀번호를 정하세요.",
  },
  "auth.field.email": { en: "Email", ko: "이메일" },
  "auth.field.email.ph": { en: "you@example.com", ko: "you@example.com" },
  "auth.field.password": { en: "Password", ko: "비밀번호" },
  "auth.field.newPassword": { en: "New password", ko: "새 비밀번호" },
  "auth.field.passwordHint": {
    en: "At least 8 characters.",
    ko: "8자 이상.",
  },
  "auth.field.code": { en: "Verification code", ko: "인증 코드" },
  "auth.field.code.ph": { en: "6-digit code", ko: "6자리 코드" },
  "auth.field.name": { en: "Name", ko: "이름" },
  "auth.field.name.ph": { en: "Your display name", ko: "표시 이름" },
  "auth.btn.login": { en: "Log in", ko: "로그인" },
  "auth.btn.sendCode": { en: "Send code", ko: "코드 받기" },
  "auth.btn.verify": { en: "Verify", ko: "확인" },
  "auth.btn.create": { en: "Create account", ko: "가입하기" },
  "auth.btn.sendReset": { en: "Send reset code", ko: "재설정 코드 보내기" },
  "auth.btn.updatePw": { en: "Update password", ko: "비밀번호 변경" },
  "auth.btn.resend": { en: "Resend code", ko: "코드 재전송" },
  "auth.forgot.link": { en: "Forgot password?", ko: "비밀번호 찾기" },
  "auth.back.login": { en: "Back to log in", ko: "로그인으로 돌아가기" },
  "auth.msg.codeSent": {
    en: "Verification code sent. Check your email.",
    ko: "인증 코드를 보냈어요. 메일을 확인하세요.",
  },
  "auth.msg.verified": { en: "Email verified.", ko: "이메일 인증 완료." },
  "auth.msg.resetSent": {
    en: "Reset code sent. Check your email.",
    ko: "재설정 코드를 보냈어요.",
  },
  "auth.msg.pwUpdated": {
    en: "Password updated. You can now log in.",
    ko: "비밀번호가 변경되었어요. 다시 로그인하세요.",
  },
  "auth.err.generic": {
    en: "Something went wrong.",
    ko: "문제가 발생했어요.",
  },
  "auth.terms": { en: "Terms", ko: "이용약관" },
  "auth.privacy": { en: "Privacy Policy", ko: "개인정보처리방침" },
  "auth.agree.before": {
    en: "By continuing you agree to our ",
    ko: "계속하면 ",
  },
  "auth.agree.between": { en: " and ", ko: "과 " },
  "auth.agree.after": { en: ".", ko: "에 동의합니다." },

  // paywall (DESIGN.md §9.12)
  "pay.title": { en: "Membership", ko: "멤버십" },
  "pay.kicker": { en: "Premium", ko: "프리미엄" },
  "pay.heading": {
    en: "Walk further with PetDate.",
    ko: "PetDate와 더 멀리.",
  },
  "pay.sub": {
    en: "Unlock unlimited swipes, see who liked you, and boost your profile.",
    ko: "무제한 스와이프, 좋아요한 사람 보기, 우선 노출까지.",
  },
  "pay.feature.swipes": {
    en: "Unlimited swipes",
    ko: "무제한 스와이프",
  },
  "pay.feature.likes": {
    en: "See who liked you",
    ko: "좋아요한 사람 확인",
  },
  "pay.feature.boost": {
    en: "Weekly profile boost",
    ko: "주간 프로필 부스트",
  },
  "pay.feature.filters": {
    en: "Advanced filters",
    ko: "고급 필터",
  },
  "pay.feature.priority": {
    en: "Priority discovery placement",
    ko: "우선 노출",
  },
  "pay.cta": { en: "Subscribe", ko: "구독 시작" },
  "pay.cta.trial": { en: "Start free trial", ko: "무료 체험 시작" },
  "pay.note.renew": {
    en: "Auto-renews. Cancel anytime from Settings.",
    ko: "자동 갱신. 언제든 설정에서 해지.",
  },
  "pay.note.refund": { en: "Refund policy", ko: "환불 정책" },
  "pay.empty.title": { en: "Plans coming soon", ko: "플랜 준비 중" },
  "pay.empty.desc": {
    en: "Subscriptions will open once billing is configured.",
    ko: "결제 설정이 끝나면 구독을 열어드려요.",
  },
  "pay.err.checkout": {
    en: "Checkout isn't available yet.",
    ko: "결제가 아직 활성화되지 않았어요.",
  },
  "pay.popular": { en: "Most popular", ko: "추천" },
  "pay.month": { en: "/ mo", ko: "/ 월" },
  "pay.year": { en: "/ yr", ko: "/ 연" },
  "pay.save": { en: "Save {pct}%", ko: "{pct}% 할인" },
};

let listeners = new Set<(l: Locale) => void>();
let current: Locale = "en";

function apply(l: Locale) {
  current = l;
  if (typeof document !== "undefined") document.documentElement.lang = l;
  listeners.forEach((fn) => fn(l));
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(current);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (localStorage.getItem(KEY) as Locale | null)
        : null;
    const initial: Locale = saved === "ko" || saved === "en" ? saved : "en";
    if (initial !== current) apply(initial);
    setLocaleState(initial);

    const sub = (l: Locale) => setLocaleState(l);
    listeners.add(sub);
    return () => {
      listeners.delete(sub);
    };
  }, []);

  const setLocale = useCallback((l: Locale) => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, l);
    apply(l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const entry = DICT[key];
      if (!entry) return key;
      let s = entry[locale] || entry.en;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
      }
      return s;
    },
    [locale]
  );

  return { locale, setLocale, t };
}
