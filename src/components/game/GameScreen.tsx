import WorldMap from '@/components/game/WorldMap';
import HudBar from '@/components/game/HudBar';
import EventPopup from '@/components/game/EventPopup';
import OverlayPanel from '@/components/game/OverlayPanel';

export default function GameScreen() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <WorldMap />
      <EventPopup />
      <HudBar />
      <OverlayPanel />
    </div>
  );
}
