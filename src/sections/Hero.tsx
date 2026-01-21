import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ArrowRight, Activity } from 'lucide-react';
import { useScrollTo } from '../hooks/useScrollTo';
import { useStaggeredEntrance } from '../hooks/useStaggeredEntrance';

export const Hero = () => {
    const { scrollY } = useScroll();
    const scrollTo = useScrollTo();
    const { container, item } = useStaggeredEntrance();

    // Parallax effects
    const y = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section id="vision" className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-50">
            {/* Background Elements - Organic Motion */}
            <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-white opacity-80" />
                <motion.div
                    style={{ y }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-drive-blue/5 rounded-full blur-3xl"
                />
            </div>

            {/* Content - Staggered Entrance */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                style={{ opacity }}
                className="relative z-10 container mx-auto px-6 text-center"
            >
                <motion.div variants={item} className="mb-8 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-drive-blue/10 text-drive-blue font-medium text-sm shadow-sm group hover:bg-white/80 transition-colors cursor-default">
                        <Activity className="w-4 h-4 animate-pulse-slow" />
                        <span>Automotive AI Infrastructure</span>
                    </div>
                </motion.div>

                <motion.h1
                    variants={item}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-gray-900 mb-8"
                >
                    DriveLink: The <span className="text-gradient inline-block">Decentralized Backbone</span> for Automotive AI
                </motion.h1>

                <motion.p
                    variants={item}
                    className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed font-light italic"
                >
                    "Connecting OEMs, Data, and Intelligence via a secure, blockchain-powered standard."
                </motion.p>

                <motion.div
                    variants={item}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button
                        className="w-full sm:w-auto text-lg px-10 py-4"
                        onClick={() => scrollTo('technology')}
                    >
                        Explore Technology
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full sm:w-auto text-lg px-10 py-4 group"
                        onClick={() => scrollTo('roadmap')}
                    >
                        View Roadmap <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
            >
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-drive-blue/40">Scroll to Explore</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-drive-blue/0 via-drive-blue/20 to-drive-blue/0" />
            </motion.div>
        </section>
    );
};
