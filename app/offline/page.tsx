export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 pb-20"
      style={{ background: "#FAFAF5" }}
    >
      <div className="text-6xl mb-6">🙏</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
        인터넷 연결이 없습니다
      </h1>
      <p className="text-sm text-gray-600 text-center leading-relaxed mb-8">
        현재 오프라인 상태입니다.<br />
        아래 기능은 오프라인에서도 사용할 수 있습니다.
      </p>

      <div
        className="w-full max-w-xs rounded-2xl p-4 space-y-2 mb-6"
        style={{
          background: "rgba(22,101,52,0.08)",
          border: "1px solid rgba(22,101,52,0.2)",
        }}
      >
        <p className="text-xs font-semibold text-green-800 mb-3">
          오프라인 사용 가능 (한 번 방문한 페이지)
        </p>
        {[
          { emoji: "📖", label: "매일 QT" },
          { emoji: "📚", label: "가이드북" },
          { emoji: "💬", label: "전도 구문집 (오디오 포함)" },
          { emoji: "🎵", label: "합창곡" },
          { emoji: "🗓", label: "공동 기도제목" },
          { emoji: "✉️", label: "기도편지 (이전에 본 것)" },
          { emoji: "📋", label: "공연 큐시트" },
        ].map(({ emoji, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-gray-700">
            <span>{emoji}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        기도 하트, QT 디브리핑은<br />인터넷 연결 후 사용 가능합니다
      </p>
    </div>
  );
}
