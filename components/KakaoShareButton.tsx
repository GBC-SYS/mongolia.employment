"use client";

import Script from "next/script";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Kakao: any;
  }
}

interface Props {
  src: string;
  letterId: string;
}

export default function KakaoShareButton({ src, letterId }: Props) {
  const handleShare = () => {
    if (typeof window === "undefined" || !window.Kakao?.isInitialized()) return;

    const imageUrl = `https://mongolia-employment.vercel.app/api/thumbnail/${letterId}`;
    const pageUrl = `https://mongolia-employment.vercel.app/prayer-letters/${letterId}`;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "몽골 선교 2026 기도편지",
        description: "함께 기도해 주세요 🙏",
        imageUrl,
        imageWidth: 800,
        imageHeight: 400,
        link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
      },
      buttons: [
        {
          title: "자세히 보기",
          link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
        },
      ],
    });
  };

  return (
    <>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
        integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
        crossOrigin="anonymous"
        onLoad={() => {
          const key = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
          if (key && window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(key);
          }
        }}
      />
      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] font-semibold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919">
          <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.7 1.6 5.1 4.05 6.6l-.9 3.3 3.75-2.55c.99.21 2.01.33 3.1.33 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
        </svg>
        카카오로 공유하기
      </button>
    </>
  );
}
