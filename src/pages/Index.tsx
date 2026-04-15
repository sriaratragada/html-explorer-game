import { useGameStore } from '@/lib/gameStore';
import TitleScreen from '@/components/game/TitleScreen';
import GameScreen from '@/components/game/GameScreen';

const Index = () => {
  const phase = useGameStore(s => s.phase);

  if (phase === 'title') {
    return <TitleScreen />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-ink">
      <GameScreen />
    </div>
  );
};

export default Index;
