import { Hero } from '@/sections/Hero';
import { FeaturedProjects } from '@/sections/FeaturedProjects';
import { FeaturedTeam } from '@/sections/FeaturedTeam';
import { Stats } from '@/sections/Stats';

export function Home() {
  return (
    <main className="relative">
      <Hero />
      <FeaturedProjects />
      <Stats />
      <FeaturedTeam />
    </main>
  );
}
