import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const Roadmap = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    });

    const pathLength = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const milestones = [
        { date: "Completed", title: "Ideation & Concept Validation", status: "completed", details: ["Foundational research", "OEM problem mapping"] },
        { date: "Completed", title: "Strategic Mentorship", status: "completed", details: ["PedalStart validation", "NMIT support"] },
        { date: "Completed", title: "Autonomous Stack v1.0", status: "completed", details: ["Core prediction software finalized", "System architecture fixed"] },
        { date: "Q1 2025", title: "Alpha Pilot Program", status: "upcoming", details: ["OEM partner integration", "Hardware-in-the-loop tests"] },
        { date: "Q2 2025", title: "Decentralized Data Node (v1)", status: "upcoming", details: ["Initial node launch", "Secure data verification"] },
        { date: "Q3 2025", title: "DRV Token Protocol Audit", status: "upcoming", details: ["Incentive layer security", "Smart contract validation"] },
        { date: "Nov 2026", title: "All Prototypes Ready", status: "upcoming", details: ["Scale to global fleets", "Cross-OEM standardization"] },
    ];

    return (
        <section id="roadmap" ref={containerRef} className="py-32 bg-[#05080a] text-white relative overflow-hidden">
            {/* Topological Background - Vertical Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            <div className="container mx-auto px-6 relative">
                <div className="max-w-4xl mx-auto mb-24 text-center">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter mb-6 uppercase"
                    >
                        The <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-900">Roadmap</span>
                    </motion.h2>
                    <p className="text-blue-200/40 tracking-[0.3em] uppercase text-xs font-bold">Strategic Evolution of V2V Intelligence</p>
                </div>

                <div className="relative">
                    {/* The Path - Central Axis */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] hidden md:block">
                        <svg className="h-full w-full" preserveAspectRatio="none">
                            <line x1="1" y1="0" x2="1" y2="100%" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                            <motion.line
                                x1="1" y1="0" x2="1" y2="100%"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                style={{ pathLength }}
                                strokeDasharray="0 1"
                            />
                        </svg>
                        {/* Glowing Tip */}
                        <motion.div
                            style={{ top: useTransform(pathLength, [0, 1], ["0%", "100%"]) }}
                            className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full blur-md shadow-[0_0_20px_#3b82f6]"
                        />
                    </div>

                    <div className="space-y-32 relative">
                        {milestones.map((item, index) => (
                            <div key={index} className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                {/* Card Side */}
                                <div className="w-full md:w-1/2 flex justify-center px-4 md:px-12">
                                    <motion.div
                                        initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                                        className="w-full max-w-md group"
                                    >
                                        <div className="relative p-[1px] rounded-none overflow-hidden sm:rounded-2xl transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                                            {/* Border Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent group-hover:from-blue-500/40 transition-colors" />

                                            <div className="relative bg-[#0a0f14] p-8 sm:rounded-2xl h-full border border-white/5">
                                                <div className="flex items-center justify-between mb-6">
                                                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-500/60">{item.date}</span>
                                                    <div className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-white/10'}`} />
                                                </div>

                                                <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-blue-400 transition-colors">{item.title}</h3>

                                                {item.details && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {item.details.map((detail, i) => (
                                                            <span key={i} className="px-2 py-1 bg-white/5 rounded text-[10px] font-medium text-gray-400 border border-white/5">
                                                                {detail}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="mt-8 flex items-center gap-4">
                                                    <div className="h-[2px] flex-1 bg-white/5 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: item.status === 'completed' ? '100%' : '20%' }}
                                                            transition={{ duration: 1.5, delay: 0.5 }}
                                                            className={`h-full ${item.status === 'completed' ? 'bg-blue-600' : 'bg-white/20'}`}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] uppercase font-black text-white/20 tracking-tighter">
                                                        {item.status === 'completed' ? 'DEPLOYED' : 'PENDING'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Center Point */}
                                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 items-center justify-center">
                                    <div className={`w-3 h-3 rounded-full border-2 border-[#05080a] ${item.status === 'completed' ? 'bg-blue-500 scale-125' : 'bg-white/20'}`} />
                                </div>

                                {/* Empty Side for spacing */}
                                <div className="hidden md:block md:w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Deep Design - Ambient Noise Layer */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay"
                style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
            />
        </section>
    );
};
