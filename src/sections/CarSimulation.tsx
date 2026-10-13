'use client';
import { V2VSimulation } from './HeroV2V';

export function CarSimulation() {
  return (
    <section
      id="simulation"
      className="dlw-section-simulation"
      aria-label="Interactive Car Simulation"
      style={{ padding: '36px 0 48px' }}
    >
      <div className="dlw-container">
        <V2VSimulation />
        <p className="dlw-hero-caption">
          Interactive concept simulation. Every figure above is modelled in your browser from the planned
          Bangalore mesh corridor — a design target, not measured field telemetry.
        </p>
      </div>
    </section>
  );
}

export const TrafficSimulator = CarSimulation;
export { V2VSimulation };
export default CarSimulation;
