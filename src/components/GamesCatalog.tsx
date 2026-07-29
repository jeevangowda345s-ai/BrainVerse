import React, { useState } from 'react';
import { 
  Gamepad2, 
  Search, 
  Play, 
  Trophy, 
  Sparkles, 
  Filter, 
  Brain,
  Grid3x3,
  Hash,
  Shapes,
  Calculator,
  LayoutGrid,
  Compass,
  BrainCircuit,
  Box,
  Palette,
  Zap,
  Target,
  BookOpen,
  Layers,
  Code
} from 'lucide-react';
import { GameInfo, CognitiveCategory } from '../types';
import { INITIAL_GAMES } from '../utils/storage';
import { audioHaptics } from '../utils/audioHaptics';

interface GamesCatalogProps {
  onSelectGame: (gameId: string) => void;
}

export const GamesCatalog: React.FC<GamesCatalogProps> = ({ onSelectGame }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All 15 Games' },
    { id: 'memory', label: 'Memory' },
    { id: 'logic', label: 'Logic & Reasoning' },
    { id: 'focus', label: 'Focus & Attention' },
    { id: 'math', label: 'Mental Math' },
    { id: 'spatial', label: 'Spatial 3D' },
    { id: 'language', label: 'Word Intelligence' },
    { id: 'coding', label: 'Coding Logic' },
    { id: 'lab', label: 'Brain Lab AI' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Grid3x3': return Grid3x3;
      case 'Hash': return Hash;
      case 'Shapes': return Shapes;
      case 'Calculator': return Calculator;
      case 'LayoutGrid': return LayoutGrid;
      case 'Compass': return Compass;
      case 'BrainCircuit': return BrainCircuit;
      case 'Box': return Box;
      case 'Palette': return Palette;
      case 'Zap': return Zap;
      case 'Target': return Target;
      case 'BookOpen': return BookOpen;
      case 'Layers': return Layers;
      case 'Code': return Code;
      case 'Sparkles': return Sparkles;
      default: return Brain;
    }
  };

  const filteredGames = INITIAL_GAMES.filter(game => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLaunch = (id: string) => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    onSelectGame(id);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#080808] border border-[#1A1A1A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-[#00F5FF]" />
            BrainVerse Mini-Games Library
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Scientifically structured exercises to train working memory, spatial reasoning, calculation speed & focus.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-[#0A0A0C] border border-[#1A1A1A] rounded-xl pl-9 pr-4 py-2 text-xs text-[#00F5FF] focus:border-[#00F5FF]/50 focus:outline-none placeholder-[#555555]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                audioHaptics.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                isActive
                  ? 'bg-[#00F5FF] text-black shadow-[0_0_15px_rgba(0,245,255,0.3)]'
                  : 'bg-[#080808] text-[#888888] hover:text-white border border-[#1A1A1A]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map((game) => {
          const IconComponent = getIcon(game.iconName);
          return (
            <div
              key={game.id}
              className="group relative rounded-2xl bg-[#080808] border border-[#1A1A1A] p-6 flex flex-col justify-between hover:border-[#00F5FF]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,245,255,0.1)] hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl p-0.5 bg-[#00F5FF]/20 border border-[#00F5FF]/40 flex items-center justify-center text-[#00F5FF]">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-[#0A0A0C] text-[#888888] border border-[#1A1A1A]">
                    {game.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-[#00F5FF] transition">
                  {game.name}
                </h3>

                <p className="text-xs text-[#888888] mt-1 mb-4 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between py-2 border-t border-[#1A1A1A] mb-4 text-xs">
                  <span className="text-[#666666] font-mono font-medium flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" /> High Score:
                  </span>
                  <span className="font-mono font-bold text-amber-400">{game.highScore}</span>
                </div>

                <button
                  onClick={() => handleLaunch(game.id)}
                  className="w-full py-2.5 rounded-xl bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-[#00F5FF] group-hover:text-black transition shadow-[0_0_10px_rgba(0,245,255,0.1)]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Exercise</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
