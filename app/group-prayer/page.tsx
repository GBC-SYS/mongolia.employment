"use client";

// 공동 기도제목 페이지
// 계좌번호 복사 기능(navigator.clipboard)이 있어 클라이언트 컴포넌트로 전체 처리
// 정적 콘텐츠이므로 force-dynamic 불필요

import React, { useState } from "react";
import { Heart, Copy, CheckCircle } from "iconoir-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 기도제목 데이터
const prayerItems = [
  "몽골 선교를 통해 오직 하나님만 영광 받으시고, 모든 팀원이 한 영혼을 향한 하나님 아버지의 마음을 깊이 깨닫게 하옵소서.",
  "모든 팀원이 영적으로 깨어 기도로 준비하며, 하나님을 의지하는 선교가 되게 하옵소서.",
  "보이지 않는 영적 방해와 공격을 막아 주시고, 예수 그리스도의 권세로 모든 사역을 지켜 보호하여 주옵소서.",
  "팀원들이 한 마음과 한 뜻, 한 목적 가운데 사랑으로 연합하여 기쁨으로 나아가게 하옵소서.",
  "낯선 환경 가운데서도 모든 팀원을 지켜 주시고, 질병과 사고 없이 영육 간에 강건하며 지치지 않도록 붙들어 주옵소서.",
  "복음을 전할 때 두려움 없이 담대함과 지혜를 더하시고, 몽골의 영혼들이 마음을 열어 복음을 받아들이며 구원의 역사가 일어나게 하옵소서.",
  "선교사님과 현지 사역자들에게 성령의 충만한 은혜를 더하시고, 단기선교팀과의 아름다운 동역을 통해 복음의 씨앗이 잘 뿌려지게 하옵소서.",
  "모든 팀원이 선교의 분명한 목적을 마음에 새기고, 맡겨진 사역에 최선을 다하며 끝까지 집중하게 하옵소서.",
  "하나님께서 행하실 일을 믿음으로 기대하게 하시고, 사람의 계획이 아닌 하나님의 일하심을 바라보게 하옵소서.",
  "몽골 땅 가운데 복음이 더욱 확장되고, 현지 교회가 세워지며 지속적인 부흥과 믿음의 세대가 일어나게 하옵소서.",
];

// 후원 계좌 정보
const bankAccount = {
  number: "3333-19-5965496",
  bank: "카카오뱅크",
  name: "견재현",
};

// Glass morphism 스타일 — CLAUDE.md 기준, iOS Safari 대응
const glass = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
} as React.CSSProperties;

const cardGlass = {
  ...glass,
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
} as React.CSSProperties;

// 브랜드 색상
const brand = "#166534";
const brandDark = "#14532d";

export default function GroupPrayerPage() {
  // 계좌번호 복사 완료 상태
  const [copied, setCopied] = useState(false);

  // 계좌번호 클립보드 복사 핸들러
  // iOS Safari Private Mode에서 SecurityError 가능성 → try-catch 처리
  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(bankAccount.number);
      setCopied(true);
      // 2초 후 복사 완료 상태 초기화
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 미지원 환경 대비 fallback
      alert(`계좌번호: ${bankAccount.number}`);
    }
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-0" style={glass}>
      {/* 헤더 */}
      <div
        className="px-5 pt-14 pb-6"
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.95)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Heart width={18} height={18} strokeWidth={1.5} style={{ color: brand }} />
          <p className="text-sm font-medium" style={{ color: brandDark }}>
            2026 나감 2000
          </p>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          공동 기도제목
        </h1>
        <p className="text-sm mb-3" style={{ color: brandDark }}>
          God so loved the world
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge
            className="border-0"
            style={{ background: "rgba(22,101,52,0.12)", color: brandDark }}
          >
            강남중앙침례교회
          </Badge>
          <Badge
            className="border-0"
            style={{ background: "rgba(22,101,52,0.12)", color: brandDark }}
          >
            2026.6.28 – 7.4
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        {/* 후원 계좌 카드 */}
        <Card className="border-0 rounded-2xl overflow-hidden" style={cardGlass}>
          <CardHeader>
            <CardTitle className="text-gray-900 text-base">후원 계좌</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-3">
              <div>
                {/* 은행명 및 예금주 */}
                <p className="text-xs text-gray-400 mb-1">
                  {bankAccount.bank} · {bankAccount.name}
                </p>
                {/* 계좌번호 */}
                <p className="text-lg font-bold tracking-wide" style={{ color: brandDark }}>
                  {bankAccount.number}
                </p>
              </div>
              {/* 계좌번호 복사 버튼 */}
              <button
                onClick={handleCopyAccount}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{
                  background: copied ? "rgba(22,101,52,0.15)" : "rgba(22,101,52,0.08)",
                  color: brandDark,
                }}
                aria-label="계좌번호 복사"
              >
                {copied ? (
                  <>
                    <CheckCircle width={15} height={15} strokeWidth={2} />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy width={15} height={15} strokeWidth={1.8} />
                    복사
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              후원해 주신 헌금은 몽골 선교 사역에 온전히 사용됩니다. 감사합니다. 🙏
            </p>
          </CardContent>
        </Card>

        {/* 기도제목 헤더 카드 */}
        <Card className="border-0 rounded-2xl" style={cardGlass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Heart width={18} height={18} strokeWidth={1.5} style={{ color: brand }} />
              몽골 선교팀 공동 기도제목
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 leading-relaxed">
              선교팀을 위해 함께 기도해 주세요. 여러분의 기도가 몽골 땅에 복음의 씨앗이 됩니다.
            </p>
          </CardContent>
        </Card>

        {/* 기도제목 목록 */}
        <div className="flex flex-col gap-2">
          {prayerItems.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl p-4 flex gap-3 items-start"
              style={cardGlass}
            >
              {/* 번호 배지 — 녹색 원형 */}
              <span
                className="flex-shrink-0 w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center mt-0.5"
                style={{
                  background: brand,
                  color: "#fff",
                  minWidth: "1.5rem",
                }}
              >
                {index + 1}
              </span>
              {/* 기도제목 텍스트 */}
              <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
