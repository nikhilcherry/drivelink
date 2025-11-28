import { GlassCard } from '../components/ui/GlassCard';
import { motion } from 'framer-motion';

export const Roadmap = () => {
    const milestones = [
        { date: "10 Nov", title: "Ideation started", status: "completed" },
        { date: "Nov", title: "Pitch to PedalStart mentors", status: "completed", details: ["Harsirjan Kour", "Sayanee Bhowmik"] },
        { date: "Nov", title: "Meeting with Simple Energy CEO", status: "completed" },
        { date: "26 Nov", title: "Investor deck created", status: "completed", details: ["Meeting with Debasis Chakraborty"] },
        { date: "Upcoming", title: "Hardware module prototype (v0.1)", status: "upcoming" },
        { date: "Upcoming", title: "Prediction Engine v0.1", status: "upcoming" },
        { date: "Upcoming", title: "DriveLink Protocol v0.1", status: "upcoming" },
        { date: "Upcoming", title: "Fleet pilot deployment", status: "upcoming" },
        { date: "Upcoming", title: "Smart City integration", status: "upcoming" },
    ];

    return (
        <section id="roadmap" className="py-24 bg-gray-900 text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-drive-blue/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <h2 className="text-4xl font-bold mb-16 text-center">Development <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Roadmap</span></h2>

                <div className="relative">
                    {/* Horizontal Line for Desktop */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />

                    <div className="flex flex-col md:flex-row gap-8 overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar">
                        {milestones.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="min-w-[300px] snap-center"
                            >
                                <div className="relative">
                                    <GlassCard className={`h-full ${item.status === 'completed' ? 'bg-white/10' : 'bg-white/5'} border-white/10 hover:border-white/30`}>
                                        <div className="text-sm font-bold text-blue-400 mb-2">{item.date}</div>
                                        <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                                        {item.details && (
                                            <ul className="text-sm text-gray-200 space-y-1 font-medium">
                                                {item.details.map((detail, i) => (
                                                    <li key={i}>{detail}</li>
                                                ))}
                                            </ul>
                                        )}
                                        <div className={`mt-4 text-xs uppercase tracking-wider font-bold ${item.status === 'completed' ? 'text-green-400' : 'text-gray-400'}`}>
                                            {item.status === 'completed' ? 'Completed' : 'Planned'}
                                        </div>
                                    </GlassCard>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
