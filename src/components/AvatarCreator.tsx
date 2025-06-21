import React from 'react';

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
  const renderEyes = () => {
    const baseStyle = "absolute bg-black";
    
    switch (avatar.eyes) {
      case 'happy':
        return (
          <>
            <div className={`${baseStyle} w-3 h-1 rounded-t-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
            <div className={`${baseStyle} w-3 h-1 rounded-t-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
          </>
        );
      case 'wink':
        return (
          <>
            <div className={`${baseStyle} w-2 h-2 rounded-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
            <div className={`${baseStyle} w-3 h-1 rounded-t-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
          </>
        );
      case 'surprised':
        return (
          <>
            <div className={`${baseStyle} w-3 h-3 rounded-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
            <div className={`${baseStyle} w-3 h-3 rounded-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
          </>
        );
      case 'sleepy':
        return (
          <>
            <div className={`${baseStyle} w-4 h-0.5 left-1/4 top-1/3 transform -translate-x-1/2`}></div>
            <div className={`${baseStyle} w-4 h-0.5 right-1/4 top-1/3 transform translate-x-1/2`}></div>
          </>
        );
      case 'star':
        return (
          <>
            <div className="absolute left-1/4 top-1/3 transform -translate-x-1/2 text-yellow-400 text-sm">✦</div>
            <div className="absolute right-1/4 top-1/3 transform translate-x-1/2 text-yellow-400 text-sm">✦</div>
          </>
        );
      default: // normal
        return (
          <>
            <div className={`${baseStyle} w-2 h-2 rounded-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
            <div className={`${baseStyle} w-2 h-2 rounded-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
          </>
        );
    }
  };

  const renderEyebrows = () => {
    if (avatar.eyebrows === 'none') return null;
    
    const baseStyle = "absolute bg-black";
    
    switch (avatar.eyebrows) {
      case 'raised':
        return (
          <>
            <div className={`${baseStyle} w-3 h-0.5 rounded-full left-1/4 top-1/4 transform -translate-x-1/2 rotate-12`}></div>
            <div className={`${baseStyle} w-3 h-0.5 rounded-full right-1/4 top-1/4 transform translate-x-1/2 -rotate-12`}></div>
          </>
        );
      case 'angry':
        return (
          <>
            <div className={`${baseStyle} w-3 h-0.5 left-1/4 top-1/4 transform -translate-x-1/2 -rotate-12`}></div>
            <div className={`${baseStyle} w-3 h-0.5 right-1/4 top-1/4 transform translate-x-1/2 rotate-12`}></div>
          </>
        );
      case 'worried':
        return (
          <>
            <div className={`${baseStyle} w-3 h-0.5 left-1/4 top-1/4 transform -translate-x-1/2 rotate-12`}></div>
            <div className={`${baseStyle} w-3 h-0.5 right-1/4 top-1/4 transform translate-x-1/2 rotate-12`}></div>
          </>
        );
      default: // normal
        return (
          <>
            <div className={`${baseStyle} w-3 h-0.5 left-1/4 top-1/4 transform -translate-x-1/2`}></div>
            <div className={`${baseStyle} w-3 h-0.5 right-1/4 top-1/4 transform translate-x-1/2`}></div>
          </>
        );
    }
  };

  const renderMouth = () => {
    const baseStyle = "absolute";
    
    switch (avatar.mouth) {
      case 'laugh':
        return (
          <div className={`${baseStyle} w-8 h-4 bg-black rounded-b-full left-1/2 bottom-1/4 transform -translate-x-1/2`}></div>
        );
      case 'neutral':
        return (
          <div className={`${baseStyle} w-6 h-0.5 bg-black left-1/2 bottom-1/4 transform -translate-x-1/2`}></div>
        );
      case 'surprised':
        return (
          <div className={`${baseStyle} w-4 h-4 bg-black rounded-full left-1/2 bottom-1/5 transform -translate-x-1/2`}></div>
        );
      case 'sad':
        return (
          <div className={`${baseStyle} w-6 h-3 border-t-2 border-black left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-t-full`}></div>
        );
      case 'tongue':
        return (
          <>
            <div className={`${baseStyle} w-6 h-3 border-b-2 border-black left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-b-full`}></div>
            <div className={`${baseStyle} w-2 h-2 bg-pink-400 rounded-full left-1/2 bottom-1/5 transform -translate-x-1/2`}></div>
          </>
        );
      default: // smile
        return (
          <div className={`${baseStyle} w-6 h-3 border-b-2 border-black left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-b-full`}></div>
        );
    }
  };

  const renderAccessory = () => {
    if (avatar.accessory === 'none') return null;
    
    const baseStyle = "absolute flex items-center justify-center";
    
    switch (avatar.accessory) {
      case 'glasses':
        return (
          <div className={`${baseStyle} left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-2xl`}>
            👓
          </div>
        );
      case 'sunglasses':
        return (
          <div className={`${baseStyle} left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-2xl`}>
            🕶️
          </div>
        );
      case 'hat':
        return (
          <div className={`${baseStyle} left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/3 text-3xl`}>
            🎩
          </div>
        );
      case 'crown':
        return (
          <div className={`${baseStyle} left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/3 text-3xl`}>
            👑
          </div>
        );
      case 'headband':
        return (
          <div className={`${baseStyle} left-1/2 top-1/6 transform -translate-x-1/2 -translate-y-1/2 text-2xl`}>
            🎀
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-28 h-28 rounded-full relative mb-6 shadow-lg transition-all duration-300 border-4 border-white/20" 
        style={{ backgroundColor: avatar.color }}
      >
        {renderEyebrows()}
        {renderEyes()}
        {renderMouth()}
        {renderAccessory()}
      </div>

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