'use client';

interface ShopBannerProps {
  timeLeft: { hours: number; mins: number; secs: number };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="bg-white/20 backdrop-blur text-white font-black text-xl w-12 h-12 flex items-center justify-center rounded-xl border border-white/30 shadow-inner tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-orange-200 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

export default function ShopBanner({ timeLeft }: ShopBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 p-6 mb-6 shadow-xl shadow-orange-500/20">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-white" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
            <span className="text-orange-100 text-xs font-semibold uppercase tracking-widest">Flash Sale</span>
          </div>
          <h2 className="text-white text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Up to 70% Off Today!
          </h2>
          <p className="text-orange-100 text-sm mt-1">Limited stock • Free delivery on ₹1000+</p>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <p className="text-orange-200 text-xs font-semibold">Ends in</p>
          </div>
          <TimeBox value={timeLeft.hours} label="hrs" />
          <span className="text-white/60 font-bold text-lg mb-3">:</span>
          <TimeBox value={timeLeft.mins} label="min" />
          <span className="text-white/60 font-bold text-lg mb-3">:</span>
          <TimeBox value={timeLeft.secs} label="sec" />
        </div>
      </div>
    </div>
  );
}
