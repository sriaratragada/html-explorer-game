import { useGameStore } from '@/lib/gameStore';
import TitleScreen from '@/components/game/TitleScreen';
import GameScreen from '@/components/game/GameScreen';
import PlayerPanel from '@/components/game/PlayerPanel';
import ChronicleView from '@/components/game/ChronicleView';

const Index = () => {
  const phase = useGameStore(s => s.phase);

  if (phase === 'title') {
    return <TitleScreen />;
  }

  if (phase === 'chronicle') {
    return <ChronicleView />;
  }

  return (
    <div className="h-screen flex bg-ink overflow-hidden">
      {/* Left panel - Player stats */}
      <div className="w-72 shrink-0 border-r border-gold/15 bg-background hidden lg:block">
        <PlayerPanel />
      </div>

      {/* Main game area */}
      <div className="flex-1 flex flex-col min-w-0">
        <GameScreen />
      </div>

      {/* Mobile bottom bar for stats access */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gold/15 bg-ink/95 backdrop-blur-sm">
        <MobileBar />
      </div>
    </div>
  );
};

function MobileBar() {
  const { playerTitle, tick, season } = useGameStore();
  const viewChronicle = useGameStore(s => s.viewChronicle);
  const { reputation } = useGameStore();

  const topRep = Object.entries(reputation).sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div>
        <p className="font-display text-xs text-parchment">{playerTitle}</p>
        <p className="font-mono text-[9px] text-mist">Tick {tick} · Top: {topRep[0]} ({topRep[1]})</p>
      </div>
      <button
        onClick={viewChronicle}
        className="px-3 py-1.5 border border-gold/20 font-mono text-[10px] text-gold uppercase tracking-wider
          hover:bg-gold/10 transition-all cursor-pointer"
      >
        📜 Chronicle
      </button>
    </div>
  );
}

export default Index;
