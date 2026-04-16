import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DialogueTree, DialogueNode, DialogueOption } from '@/lib/dialogue';

interface Props {
  tree: DialogueTree;
  onClose: () => void;
  onEffect?: (option: DialogueOption) => void;
}

export default function DialogueView({ tree, onClose, onEffect }: Props) {
  const [currentNodeId, setCurrentNodeId] = useState(tree.startNodeId);
  const node = tree.nodes[currentNodeId];

  const handleOption = useCallback((option: DialogueOption) => {
    if (onEffect) onEffect(option);
    if (option.nextNodeId) {
      setCurrentNodeId(option.nextNodeId);
    } else {
      onClose();
    }
  }, [onClose, onEffect]);

  if (!node) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute bottom-12 left-4 right-4 z-50 max-w-2xl mx-auto pointer-events-auto"
    >
      <div className="bg-ink/95 border border-gold/20 backdrop-blur-md p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-[1px] bg-gold/30" />
          <span className="font-display text-xs text-gold uppercase tracking-widest">{node.speaker}</span>
          <div className="flex-1 h-[1px] bg-gold/30" />
        </div>

        <p className="font-body text-sm text-parchment/90 leading-relaxed mb-3">{node.text}</p>

        <div className="space-y-1.5">
          {node.options.map((option, idx) => (
            <button
              key={option.id}
              onClick={() => handleOption(option)}
              className="w-full text-left px-3 py-2 border border-gold/15 text-parchment/80 hover:border-gold/40 hover:bg-gold/5 hover:text-gold font-mono-game text-[11px] transition-all cursor-pointer"
            >
              <span className="text-gold/40 mr-2">[{idx + 1}]</span>
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
