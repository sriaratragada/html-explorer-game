import { getWeaponDamage, getTotalArmor, Inventory } from './craftingSystem';
import { SkillTree } from './skills';
import { WorldEntity, getEntitiesNear, removeEntity } from './worldEntities';

export interface CombatResult {
  hit: boolean;
  damage: number;
  killed: boolean;
  targetId: string;
  xpGain: number;
}

export function playerAttack(
  px: number, py: number,
  facingDx: number, facingDy: number,
  inventory: Inventory,
  skills: SkillTree,
): CombatResult | null {
  const attackRange = 3;
  const enemies = getEntitiesNear(px, py, attackRange)
    .filter(e => ['wolf', 'bandit', 'warband', 'bear'].includes(e.kind));

  if (enemies.length === 0) return null;

  // Pick closest enemy in facing direction
  let best: WorldEntity | null = null;
  let bestDist = Infinity;
  for (const e of enemies) {
    const dx = e.x - px, dy = e.y - py;
    const dot = dx * facingDx + dy * facingDy;
    if (dot < 0) continue; // behind player
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bestDist) { bestDist = dist; best = e; }
  }
  if (!best) {
    // Fallback: hit closest regardless of direction
    best = enemies.reduce((a, b) => {
      const da = (a.x - px) ** 2 + (a.y - py) ** 2;
      const db = (b.x - px) ** 2 + (b.y - py) ** 2;
      return da < db ? a : b;
    });
  }

  const baseDamage = getWeaponDamage(inventory);
  const skillBonus = Math.floor(skills.combat.level * 1.5);
  const hasPowerStrike = skills.combat.perks.includes('power_strike');
  const totalDamage = Math.max(1, Math.floor((baseDamage + skillBonus) * (hasPowerStrike ? 1.2 : 1)));

  best.hp -= totalDamage;
  const killed = best.hp <= 0;
  if (killed) removeEntity(best.id);

  const xpGain = killed ? getKillXp(best.kind) : Math.floor(totalDamage * 0.5);

  return { hit: true, damage: totalDamage, killed, targetId: best.id, xpGain };
}

function getKillXp(kind: string): number {
  switch (kind) {
    case 'wolf': return 15;
    case 'bandit': return 25;
    case 'warband': return 50;
    case 'bear': return 30;
    default: return 10;
  }
}

export function enemyAttackDamage(enemy: WorldEntity, playerArmor: number): number {
  let baseDmg = 5;
  switch (enemy.kind) {
    case 'wolf': baseDmg = 5; break;
    case 'bandit': baseDmg = 8; break;
    case 'warband': baseDmg = 15; break;
    case 'bear': baseDmg = 12; break;
  }
  return Math.max(1, baseDmg - Math.floor(playerArmor * 0.5));
}

export function getAggroRadius(enemy: WorldEntity): number {
  switch (enemy.kind) {
    case 'wolf': return 8;
    case 'bandit': return 12;
    case 'warband': return 15;
    case 'bear': return 6;
    default: return 10;
  }
}
