
import { GlassCard } from '../components/ui/GlassCard';
import { User, Code, Cpu } from 'lucide-react';

export const Team = () => {
    const team = [
        {
            name: "Hruday",
            role: "CEO & Chief Systems Architect",
            icon: <User className="w-12 h-12 text-drive-blue" />,
            bio: "Leads vision, protocol architecture, high-level systems strategy, partnerships, and standardization roadmap."
        },
        {
            name: "Nikhil",
            role: "CTO",
            subRole: "Computer Science & Engineering",
            icon: <Code className="w-12 h-12 text-drive-blue" />,
            bio: "Builds the prediction engine, simulation environment, and V2V messaging intelligence."
        },
        {
            name: "Krishna",
            role: "CPO",
            subRole: "Mechanical Engineering",
            icon: <Cpu className="w-12 h-12 text-drive-blue" />,
            bio: "Handles hardware feasibility, integration, mechanical systems, and real-vehicle interfacing."
        }
    ];

    return (
        <section id="team" className="py-24 bg-gray-50">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold mb-16 text-center">Meet the <span className="text-gradient">Visionaries</span></h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {team.map((member, index) => (
                        <GlassCard key={index} delay={index * 0.2} className="text-center group">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-white shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                {member.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h3>
                            <p className="text-drive-blue font-semibold mb-1">{member.role}</p>
                            {member.subRole && <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">{member.subRole}</p>}
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {member.bio}
                            </p>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
};
