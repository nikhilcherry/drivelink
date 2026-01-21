
import { GlassCard } from '../components/ui/GlassCard';
import { Shield, Zap, Cpu } from 'lucide-react';

export const CoreAbilities = () => {
    const abilities = [
        {
            icon: <Shield className="w-8 h-8 text-drive-blue" />,
            title: "The Core Problem",
            description: "High costs of high-definition maps, lack of data standardization, and siloed automotive ecosystems."
        },
        {
            icon: <Zap className="w-8 h-8 text-drive-blue" />,
            title: "The Solution",
            description: "Unified data protocol, decentralized AI training, and incentive-based data sharing."
        },
        {
            icon: <Cpu className="w-8 h-8 text-drive-blue" />,
            title: "Our Technology",
            description: "Leveraging decentralized infrastructure to create the ultimate automotive AI backbone."
        }
    ];

    return (
        <section id="technology" className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-gray-900">
                        The Decentralized <span className="text-gradient">Backbone</span>
                    </h2>
                    <p className="text-xl text-gray-500">
                        Solving the core challenges of automotive AI through a unified, secure protocol.
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
