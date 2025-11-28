
import { GlassCard } from '../components/ui/GlassCard';
import { Calendar, Users, Lightbulb, TrendingUp } from 'lucide-react';

export const Story = () => {
    const events = [
        {
            date: "10 November",
            title: "Ideation",
            icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
            content: "The founders realized the modern driving world suffers because vehicles operate as isolated agents. No shared intent → late reactions → preventable accidents. DriveLink was born to fix this."
        },
        {
            date: "Validation",
            title: "First Validation",
            icon: <Users className="w-6 h-6 text-blue-500" />,
            content: (
                <>
                    <p className="mb-2">The early concept was pitched to PedalStart mentors:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                        <li><strong>Harsirjan Kour</strong> (Core Team @ PedalStart)</li>
                        <li><strong>Sayanee Bhowmik</strong> (Ex-VC, Startup Mentor)</li>
                    </ul>
                    <p className="mt-2 text-sm italic">They validated the idea, refined the vision, and guided the foundational direction.</p>
                </>
            )
        },
        {
            date: "Insight",
            title: "Industry Insight",
            icon: <TrendingUp className="w-6 h-6 text-green-500" />,
            content: "The team spoke with the CEO of Simple Energy, gaining crucial EV-industry insights into fleet movement patterns and real-world communication challenges."
        },
        {
            date: "26 November",
            title: "First Investor Deck",
            icon: <Calendar className="w-6 h-6 text-purple-500" />,
            content: (
                <>
                    <p className="mb-2">The founders built a high-impact pitch deck and met a VC contact:</p>
                    <p className="font-semibold">Debasis Chakraborty</p>
                    <p className="text-sm text-gray-600">CEO & Founder, Dariaan Consulting</p>
                </>
            )
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold mb-16 text-center">Our <span className="text-gradient">Origin Story</span></h2>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-drive-blue/0 via-drive-blue/30 to-drive-blue/0" />

                    <div className="space-y-12">
                        {events.map((event, index) => (
                            <div key={index} className={`flex flex-col md:flex-row gap-8 items-start ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="flex-1 w-full md:w-auto">
                                    <GlassCard className="h-full hover:border-drive-blue/30 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-sm font-bold text-drive-blue uppercase tracking-wider">{event.date}</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                                        <div className="text-gray-600 leading-relaxed">
                                            {event.content}
                                        </div>
                                    </GlassCard>
                                </div>

                                <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-white border-4 border-gray-50 shadow-lg flex items-center justify-center">
                                    {event.icon}
                                </div>

                                <div className="flex-1 hidden md:block" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <div className="inline-block p-6 rounded-2xl bg-gray-50 border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">Current Pipeline</h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {["Preparing follow-ups with Simple Energy", "Connecting with automation systems expert", "Engaging with GHAT Section Safe Mobility"].map((item, i) => (
                                    <span key={i} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-100">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
