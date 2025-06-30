import React from 'react';
import AvatarDisplay from './AvatarDisplay';

interface AvatarProps {
  avatar: {
    eyes: string;
    mouth: string;
    color: string;
    accessory: string;
    eyebrows: string;
  };
  setAvatar: (avatar: { eyes: string; mouth: string; color: string; accessory: string; eyebrows: string }) => void;
}

const eyeOptions = [
  { id: 'normal', label: '👀 Normal', emoji: '●●' },
  { id: 'happy', label: '😊 Happy', emoji: '^^' },
  { id: 'wink', label: '😉 Wink', emoji: '●^' },
  { id: 'surprised', label: '😲 Surprised', emoji: '○○' },
  { id: 'sleepy', label: '😴 Sleepy', emoji: '--' },
  { id: 'star', label: '🤩 Star', emoji: '✦✦' },
];

const mouthOptions = [
  { id: 'smile', label: '😊 Smile', emoji: '⌒' },
  { id: 'laugh', label: '😄 Laugh', emoji: 'D' },
  { id: 'neutral', label: '😐 Neutral', emoji: '—' },
  { id: 'surprised', label: '😮 Surprised', emoji: 'O' },
  { id: 'sad', label: '😢 Sad', emoji: '⌒' },
  { id: 'tongue', label: '😛 Tongue', emoji: 'P' },
];

const eyebrowOptions = [
  { id: 'normal', label: '😐 Normal', emoji: '‾‾' },
  { id: 'raised', label: '🤨 Raised', emoji: '⌒⌒' },
  { id: 'angry', label: '😠 Angry', emoji: '\\/' },
  { id: 'worried', label: '😟 Worried', emoji: '/\\' },
  { id: 'none', label: '🙂 None', emoji: '  ' },
];

const accessoryOptions = [
  { id: 'none', label: '🙂 None', emoji: '' },
  { id: 'glasses', label: '🤓 Glasses', emoji: '👓' },
  { id: 'sunglasses', label: '😎 Sunglasses', emoji: '🕶️' },
  { id: 'hat', label: '🎩 Hat', emoji: '🎩' },
  { id: 'crown', label: '👑 Crown', emoji: '👑' },
  { id: 'headband', label: '🏃 Headband', emoji: '🎀' },
];

const colorOptions = [
  { color: '#FF6B6B', name: 'Coral Red' },
  { color: '#4ECDC4', name: 'Turquoise' },
  { color: '#45B7D1', name: 'Sky Blue' },
  { color: '#96CEB4', name: 'Mint Green' },
  { color: '#FFEAA7', name: 'Warm Yellow' },
  { color: '#DDA0DD', name: 'Plum' },
  { color: '#98D8C8', name: 'Seafoam' },
  { color: '#F7DC6F', name: 'Golden' },
  { color: '#BB8FCE', name: 'Lavender' },
  { color: '#85C1E9', name: 'Light Blue' },
  { color: '#F8C471', name: 'Peach' },
  { color: '#82E0AA', name: 'Light Green' },
];

const AvatarCreator: React.FC<AvatarProps> = ({ avatar, setAvatar }) => {
  return (
    <div className="flex flex-col items-center">
      <AvatarDisplay 
        avatar={avatar} 
        size="xl" 
        animate={true}
        className="mb-6 shadow-lg"
      />

      <div className="w-full grid grid-cols-1 gap-6">
        {/* Eyes */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-white">Eyes</label>
          <div className="grid grid-cols-2 gap-2">
            {eyeOptions.map((eye) => (
              <button
                key={eye.id}
                onClick={() => setAvatar({ ...avatar, eyes: eye.id })}
                className={`py-2 px-3 text-xs rounded-lg transition-all duration-200 font-medium ${
                  avatar.eyes === eye.id
                    ? 'bg-white text-purple-700 shadow-md transform scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mb-1">{eye.emoji}</span>
                  <span className="text-xs">{eye.label.split(' ')[1]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Eyebrows */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-white">Eyebrows</label>
          <div className="grid grid-cols-2 gap-2">
            {eyebrowOptions.map((eyebrow) => (
              <button
                key={eyebrow.id}
                onClick={() => setAvatar({ ...avatar, eyebrows: eyebrow.id })}
                className={`py-2 px-3 text-xs rounded-lg transition-all duration-200 font-medium ${
                  avatar.eyebrows === eyebrow.id
                    ? 'bg-white text-purple-700 shadow-md transform scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mb-1">{eyebrow.emoji}</span>
                  <span className="text-xs">{eyebrow.label.split(' ')[1]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mouth */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-white">Mouth</label>
          <div className="grid grid-cols-2 gap-2">
            {mouthOptions.map((mouth) => (
              <button
                key={mouth.id}
                onClick={() => setAvatar({ ...avatar, mouth: mouth.id })}
                className={`py-2 px-3 text-xs rounded-lg transition-all duration-200 font-medium ${
                  avatar.mouth === mouth.id
                    ? 'bg-white text-purple-700 shadow-md transform scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mb-1">{mouth.emoji}</span>
                  <span className="text-xs">{mouth.label.split(' ')[1]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-white">Accessories</label>
          <div className="grid grid-cols-2 gap-2">
            {accessoryOptions.map((accessory) => (
              <button
                key={accessory.id}
                onClick={() => setAvatar({ ...avatar, accessory: accessory.id })}
                className={`py-2 px-3 text-xs rounded-lg transition-all duration-200 font-medium ${
                  avatar.accessory === accessory.id
                    ? 'bg-white text-purple-700 shadow-md transform scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mb-1">{accessory.emoji}</span>
                  <span className="text-xs">{accessory.label.split(' ')[1]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-white">Color</label>
          <div className="grid grid-cols-4 gap-3">
            {colorOptions.map((colorOption) => (
              <button
                key={colorOption.color}
                onClick={() => setAvatar({ ...avatar, color: colorOption.color })}
                className={`w-12 h-12 rounded-full transition-all duration-200 border-4 ${
                  avatar.color === colorOption.color 
                    ? 'border-white shadow-lg transform scale-110' 
                    : 'border-white/30 hover:border-white/60 hover:scale-105'
                }`}
                style={{ backgroundColor: colorOption.color }}
                title={colorOption.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCreator;