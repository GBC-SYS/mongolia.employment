import Link from "next/link";
import { Mail, Book, Calendar, MusicNote } from "iconoir-react";
import Countdown from "@/components/Countdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const schedule = [
  { date: "6/28 (일)", desc: "인천 출발 → 울란바토르 도착" },
  { date: "6/29 (월)", desc: "울란바토르 사역" },
  { date: "6/30 (화)", desc: "이동 및 현지 사역" },
  { date: "7/1 (수)", desc: "현지 사역" },
  { date: "7/2 (목)", desc: "현지 사역" },
  { date: "7/3 (금)", desc: "이동 및 현지 사역" },
  { date: "7/4 (토)", desc: "귀국 출발" },
];

const glass = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.95)",
} as React.CSSProperties;

const brand = "#166534";
const brandDark = "#14532d";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <div className="px-5 pt-14 pb-8" style={glass}>
        <p className="text-sm mb-1 font-medium" style={{ color: brandDark }}>🇲🇳 몽골 단기선교팀</p>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">몽골 선교 2026</h1>
        <Badge
          className="border-0"
          style={{ background: "rgba(22,101,52,0.12)", color: brandDark }}
        >
          6월 28일 – 7월 4일
        </Badge>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4" style={glass}>
        {/* 카운트다운 */}
        <Countdown />

        {/* 소개 문구 */}
        <Card className="border-0 rounded-2xl" style={glass}>
          <CardContent className="pt-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              몽골의 초원 위에서 복음을 전하고, 함께 기도하며 나아가는 선교팀입니다.
              기도편지를 통해 함께 기도해 주세요. 🙏
            </p>
          </CardContent>
        </Card>

        {/* 빠른 진입 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/prayer-letters"
            className="rounded-2xl p-5 flex flex-col gap-3 active:scale-95 transition-transform"
            style={glass}
          >
            <Mail width={28} height={28} strokeWidth={1.5} style={{ color: brand }} />
            <div>
              <p className="font-semibold text-gray-900">기도편지</p>
              <p className="text-gray-500 text-xs mt-0.5">선교팀 소식 보기</p>
            </div>
          </Link>
          <Link
            href="/guide"
            className="rounded-2xl p-5 flex flex-col gap-3 active:scale-95 transition-transform"
            style={glass}
          >
            <Book width={28} height={28} strokeWidth={1.5} style={{ color: brand }} />
            <div>
              <p className="font-semibold text-gray-900">가이드북</p>
              <p className="text-gray-500 text-xs mt-0.5">준비물 & 안전수칙</p>
            </div>
          </Link>
        </div>

        {/* 합창곡 진입 카드 */}
        <Link
          href="/song"
          className="rounded-2xl p-5 flex items-center gap-4 active:scale-95 transition-transform"
          style={glass}
        >
          <MusicNote width={28} height={28} strokeWidth={1.5} style={{ color: brand }} />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">합창곡</p>
            <p className="text-gray-500 text-xs mt-0.5">한·몽 가사 보기</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(22,101,52,0.10)", color: brandDark }}>송폼</span>
        </Link>

        {/* 성경 말씀 */}
        <Card className="border-0 rounded-2xl overflow-hidden" style={glass}>
          <CardContent className="pt-4 pb-4">
            <p className="text-gray-800 text-sm leading-relaxed font-medium italic">
              "다시 밤이 없겠고 햇빛도 쓸 데 없으리 이는 주 하나님이 그들에게 비치심이라 그들이 세세토록 왕 노릇 하리로다"
            </p>
            <p className="text-xs mt-2 font-semibold" style={{ color: brandDark }}>요한계시록 22:5</p>
          </CardContent>
        </Card>

        {/* 선교 일정 */}
        <Card className="border-0 rounded-2xl" style={glass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calendar width={18} height={18} style={{ color: brand }} />
              선교 일정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {schedule.map((item) => (
                <div key={item.date} className="flex gap-3 items-start">
                  <span className="text-xs font-mono font-semibold w-20 pt-0.5 flex-shrink-0" style={{ color: brandDark }}>
                    {item.date}
                  </span>
                  <span className="text-gray-700 text-sm">{item.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
