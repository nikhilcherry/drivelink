
import { GlassCard } from '../components/ui/GlassCard';
import { Brain, Radio, Zap } from 'lucide-react';

export const CoreAbilities = () => {
    const abilities = [
        {
            icon: <Brain className="w-8 h-8 text-drive-blue" />,
            title: "Understand Behavior",
            description: "Analyzes speed, steering, braking, and acceleration patterns to understand vehicle intent in real-time."
        },
        {
            icon: <Zap className="w-8 h-8 text-drive-blue" />,
            title: "Predict Motion",
            description: "Advanced algorithms predict future motion through short prediction windows, anticipating maneuvers before they happen."
        },
        {
            icon: <Radio className="w-8 h-8 text-drive-blue" />,
            title: "Communicate Intent",
            description: "Shares predictions with nearby vehicles with sub-50ms latency, creating a cooperative intelligence layer."
        }
    ];

    return (
        <section id="technology" className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-gray-900">
                        The Missing <span className="text-gradient">Intelligence Layer</span>
                    </h2>
                    <p className="text-xl text-gray-500">
                        Today’s vehicles see things but don’t communicate. DriveLink changes that by enabling cars to "talk" to each other.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {abilities.map((ability, index) => (
                        <GlassCard key={index} delay={index * 0.2} className="h-full">
                            <div className="w-16 h-16 rounded-2xl bg-drive-blue/5 flex items-center justify-center mb-6">
                                {ability.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">{ability.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {ability.description}
                            </p>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
};
