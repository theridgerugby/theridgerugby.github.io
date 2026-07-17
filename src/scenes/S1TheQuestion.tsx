import { motion } from "framer-motion";
import { BellOff, ChevronLeft, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassSurface } from "../components/Glass";
import { Spotlight } from "../components/Spotlight";
import { remap } from "../lib/timeline";

interface S1Props {
  localP: number;
}

const REPLY = "因为中国人已经三十年没有拿诺贝尔物理奖了。";
const GROUP = "八年六班";

export function S1TheQuestion({ localP }: S1Props) {
  const panelOpacity = remap(localP, 0.1, 0.22);
  const questionOpacity = remap(localP, 0.28, 0.4);
  const replyOpacity = remap(localP, 0.5, 0.6);
  const typeProgress = remap(localP, 0.6, 0.92);
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    setTyped(Math.round(typeProgress * REPLY.length));
  }, [typeProgress]);

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center font-sc" style={{ fontFamily: "var(--font-sc)" }}>
      {/* a cool spotlight pool finds the phone in the dark */}
      <Spotlight x="50%" y="38%" size="54vw" tint="rgba(185,200,235,0.16)" dust={10} opacity={panelOpacity} />

      {/* Liquid Glass phone bezel wrapping an authentic WeChat screen */}
      <motion.div style={{ opacity: panelOpacity }}>
        <GlassSurface
          frost
          className="relative rounded-[40px] p-[10px]"
          style={{ width: 404, maxWidth: "82vw", boxShadow: "0 40px 120px rgba(0,0,0,0.7)" }}
        >
          <div lang="zh-CN" className="overflow-hidden" style={{ borderRadius: 30, background: "#ededed" }}>
            {/* WeChat nav header */}
            <div className="relative flex items-center justify-center" style={{ height: 52, background: "#f7f7f7", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <ChevronLeft size={23} strokeWidth={2.2} className="absolute left-3 text-[#111]" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <span className="text-[#111] text-[16px] font-medium">{GROUP}</span>
                <BellOff size={15} strokeWidth={1.8} className="text-[#8a8a8a]" aria-hidden="true" />
              </div>
              <MoreHorizontal size={23} strokeWidth={2.4} className="absolute right-3 text-[#111]" aria-hidden="true" />
            </div>

            {/* chat body */}
            <div className="px-3 py-5 flex flex-col gap-5" style={{ background: "#ededed", minHeight: 260 }}>
              <div className="flex justify-center">
                <span className="text-[11px] text-[#666] bg-black/5 px-2 py-0.5 rounded">下午 3:24</span>
              </div>

              {/* incoming */}
              <motion.div className="flex items-start gap-2.5" style={{ opacity: questionOpacity }}>
                <div className="shrink-0 w-10 h-10 rounded-[6px]" style={{ background: "linear-gradient(135deg,#8fa6c4,#5b6d86)" }} />
                <div className="relative">
                  <span className="absolute" style={{ left: -5, top: 13, width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "6px solid #fff" }} />
                  <div className="bg-white text-[#111] text-[16px] leading-relaxed px-3.5 py-2.5" style={{ borderRadius: 8 }}>
                    你为什么要去加拿大?
                  </div>
                </div>
              </motion.div>

              {/* outgoing — the reply, typewriter, given weight */}
              <motion.div className="flex items-start gap-2.5 flex-row-reverse" style={{ opacity: replyOpacity }}>
                <div className="shrink-0 w-10 h-10 rounded-[6px]" style={{ background: "linear-gradient(135deg,#c9a06a,#8a6a3a)" }} />
                <div className="relative max-w-[74%]">
                  <span className="absolute" style={{ right: -5, top: 13, width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: "6px solid #95ec69" }} />
                  <div className="text-[#111] text-[16px] leading-relaxed px-3.5 py-2.5" style={{ background: "#95ec69", borderRadius: 8 }}>
                    {REPLY.slice(0, typed)}
                    <span style={{ opacity: typed < REPLY.length ? 1 : 0, borderRight: "2px solid rgba(0,0,0,0.55)", marginLeft: 1 }} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </GlassSurface>
      </motion.div>
      <p className="sr-only" lang="en">
        A classmate asks, “Why are you going to Canada?” Ethan replies, “Because a Chinese person hasn’t won the Nobel Prize in Physics in thirty years.”
      </p>
    </div>
  );
}
