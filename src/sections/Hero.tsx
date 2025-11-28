import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ArrowRight, Activity } from 'lucide-react';

export const Hero = () => {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section id="vision" className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-50">
            {/* Background Elements */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-white opacity-80" />
                <motion.div
                    style={{ y }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-drive-blue/5 rounded-full blur-3xl"
                />
            </div>

            {/* Content */}
            <motion.div
                style={{ opacity }}
                className="relative z-10 container mx-auto px-6 text-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-drive-blue/10 text-drive-blue font-medium text-sm mb-8 shadow-sm"
                >
                    <Activity className="w-4 h-4" />
                    <span>The Future of V2V Communication</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-gray-900 mb-8"
                >
                    Mobility, <span className="text-gradient">Connected.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
                >
                    DriveLink is the universal operating system for vehicle-to-vehicle communication.
                    We enable cars to share intent, trajectory, and future movement in real-time.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button
                        className="w-full sm:w-auto text-lg px-10 py-4"
                        onClick={() => document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Explore Technology
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full sm:w-auto text-lg px-10 py-4 group"
                        onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}
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
                <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-drive-blue/0 via-drive-blue/50 to-drive-blue/0" />
            </motion.div>
        </section>
    );
};
