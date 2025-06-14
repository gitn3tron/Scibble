import React from 'react';

interface AvatarProps {
  avatar: {
    eyes: string;
    mouth: string;
    color: string;
  };
  setAvatar: (avatar: { eyes: string; mouth: string; color: string }) => void;
}

const eyeOptions = [
  { id: 'normal', label: 'Normal' },
  { id: 'happy', label: 'Happy' },
  { id: 'wink', label: 'Wink' },
  { id: 'surprised', label: 'Surprised' },
];

const mouthOptions = [
  { id: 'smile', label: 'Smile' },
  { id: 'laugh', label: 'Laugh' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'surprised', label: 'Surprised' },
];

const colorOptions = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EF4444', // Red
];

const AvatarCreator: React.FC<AvatarProps> = ({ avatar, setAvatar }) => {
  const renderEyes = () => {
    switch (avatar.eyes) {
      case 'happy':
        return (
          <>
            <div className="w-2 h-1 bg-black rounded-t-full absolute left-1/4 top-1/3"></div>
            <div className="w-2 h-1 bg-black rounded-t-full absolute right-1/4 top-1/3"></div>
          </>
        );
      case 'wink':
        return (
          <>
            <div className="w-2 h-2 bg-black rounded-full absolute left-1/4 top-1/3"></div>
            <div className="w-2 h-1 bg-black rounded-t-full absolute right-1/4 top-1/3"></div>
          </>
        );
      case 'surprised':
        return (
          <>
            <div className="w-2 h-2 bg-black rounded-full absolute left-1/4 top-1/3"></div>
            <div className="w-2 h-2 bg-black rounded-full absolute right-1/4 top-1/3"></div>
          </>
        );
      default: // normal
        return (
          <>
            <div className="w-2 h-2 bg-black rounded-full absolute left-1/4 top-1/3"></div>
            <div className="w-2 h-2 bg-black rounded-full absolute right-1/4 top-1/3"></div>
          </>
        );
    }
  };

  const renderMouth = () => {
    switch (avatar.mouth) {
      case 'laugh':
        return (
          <div className="w-6 h-3 bg-black rounded-b-full absolute left-1/2 bottom-1/4 transform -translate-x-1/2"></div>
        );
      case 'neutral':
        return (
          <div className="w-6 h-1 bg-black absolute left-1/2 bottom-1/4 transform -translate-x-1/2"></div>
        );
      case 'surprised':
        return (
          <div className="w-4 h-4 bg-black rounded-full absolute left-1/2 bottom-1/5 transform -translate-x-1/2"></div>
        );
      default: // smile
        return (
          <div className="w-6 h-3 border-b-2 border-black absolute left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-b-full"></div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-24 h-24 rounded-full relative mb-4 shadow-md transition-all duration-300" 
        style={{ backgroundColor: avatar.color }}
      >
        {renderEyes()}
        {renderMouth()}
      </div>

      <div className="w-full grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Eyes</label>
          <div className="grid grid-cols-2 gap-2">
            {eyeOptions.map((eye) => (
              <button
                key={eye.id}
                onClick={() => setAvatar({ ...avatar, eyes: eye.id })}
                className={`py-1 px-2 text-xs rounded ${
                  avatar.eyes === eye.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {eye.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mouth</label>
          <div className="grid grid-cols-2 gap-2">
            {mouthOptions.map((mouth) => (
              <button
                key={mouth.id}
                onClick={() => setAvatar({ ...avatar, mouth: mouth.id })}
                className={`py-1 px-2 text-xs rounded ${
                  avatar.mouth === mouth.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {mouth.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 w-full">
        <label className="block text-sm font-medium mb-2">Color</label>
        <div className="flex flex-wrap justify-center gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => setAvatar({ ...avatar, color })}
              className={`w-8 h-8 rounded-full transition-transform ${
                avatar.color === color ? 'transform scale-110 ring-2 ring-offset-2 ring-gray-400' : ''
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarCreator;