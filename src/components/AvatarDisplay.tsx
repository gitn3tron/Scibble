import React from 'react';

interface Avatar {
  eyes: string;
  mouth: string;
  color: string;
  accessory: string;
  eyebrows: string;
}

interface AvatarDisplayProps {
  avatar: Avatar;
  size?: 'small' | 'medium' | 'large' | 'xl';
  isDrawing?: boolean;
  animate?: boolean;
  className?: string;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ 
  avatar, 
  size = 'medium', 
  isDrawing = false, 
  animate = true,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-28 h-28'
  };

  const eyeSizes = {
    small: { normal: 'w-1 h-1', wide: 'w-1.5 h-1.5', line: 'w-2 h-0.5' },
    medium: { normal: 'w-1.5 h-1.5', wide: 'w-2 h-2', line: 'w-3 h-0.5' },
    large: { normal: 'w-2 h-2', wide: 'w-2.5 h-2.5', line: 'w-3 h-0.5' },
    xl: { normal: 'w-2 h-2', wide: 'w-3 h-3', line: 'w-4 h-0.5' }
  };

  const mouthSizes = {
    small: { normal: 'w-3 h-1.5', wide: 'w-4 h-2', line: 'w-3 h-0.5', small: 'w-2 h-2' },
    medium: { normal: 'w-4 h-2', wide: 'w-5 h-3', line: 'w-4 h-0.5', small: 'w-3 h-3' },
    large: { normal: 'w-5 h-2.5', wide: 'w-6 h-3.5', line: 'w-5 h-0.5', small: 'w-3.5 h-3.5' },
    xl: { normal: 'w-6 h-3', wide: 'w-8 h-4', line: 'w-6 h-0.5', small: 'w-4 h-4' }
  };

  const eyebrowSizes = {
    small: 'w-2 h-0.5',
    medium: 'w-2.5 h-0.5',
    large: 'w-3 h-0.5',
    xl: 'w-3 h-0.5'
  };

  const accessorySizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-lg',
    xl: 'text-2xl'
  };

  const renderEyes = () => {
    const baseStyle = "absolute bg-black border border-gray-800";
    const animationClass = animate ? "animate-blink" : "";
    const sizes = eyeSizes[size];
    
    switch (avatar.eyes) {
      case 'happy':
        return (
          <>
            <div className={`${baseStyle} ${sizes.line} left-1/4 top-1/3 transform -translate-x-1/2 ${animationClass}`}></div>
            <div className={`${baseStyle} ${sizes.line} right-1/4 top-1/3 transform translate-x-1/2 ${animationClass}`}></div>
          </>
        );
      case 'wink':
        return (
          <>
            <div className={`${baseStyle} ${sizes.normal} left-1/4 top-1/3 transform -translate-x-1/2 ${animationClass}`}></div>
            <div className={`${baseStyle} ${sizes.line} right-1/4 top-1/3 transform translate-x-1/2`}></div>
          </>
        );
      case 'surprised':
        return (
          <>
            <div className={`${baseStyle} ${sizes.wide} left-1/4 top-1/3 transform -translate-x-1/2 ${animationClass}`}></div>
            <div className={`${baseStyle} ${sizes.wide} right-1/4 top-1/3 transform translate-x-1/2 ${animationClass}`}></div>
          </>
        );
      case 'sleepy':
        return (
          <>
            <div className={`${baseStyle} ${sizes.line} left-1/4 top-1/3 transform -translate-x-1/2`}></div>
            <div className={`${baseStyle} ${sizes.line} right-1/4 top-1/3 transform translate-x-1/2`}></div>
          </>
        );
      case 'star':
        return (
          <>
            <div className={`absolute left-1/4 top-1/3 transform -translate-x-1/2 text-yellow-400 ${accessorySizes[size]} ${animate ? 'animate-pulse' : ''}`}>✦</div>
            <div className={`absolute right-1/4 top-1/3 transform translate-x-1/2 text-yellow-400 ${accessorySizes[size]} ${animate ? 'animate-pulse' : ''}`}>✦</div>
          </>
        );
      default: // normal
        return (
          <>
            <div className={`${baseStyle} ${sizes.normal} left-1/4 top-1/3 transform -translate-x-1/2 ${animationClass}`}></div>
            <div className={`${baseStyle} ${sizes.normal} right-1/4 top-1/3 transform translate-x-1/2 ${animationClass}`}></div>
          </>
        );
    }
  };

  const renderEyebrows = () => {
    if (avatar.eyebrows === 'none') return null;
    
    const baseStyle = `absolute bg-black border border-gray-800 ${eyebrowSizes[size]}`;
    
    switch (avatar.eyebrows) {
      case 'raised':
        return (
          <>
            <div className={`${baseStyle} left-1/4 top-1/4 transform -translate-x-1/2 rotate-12`}></div>
            <div className={`${baseStyle} right-1/4 top-1/4 transform translate-x-1/2 -rotate-12`}></div>
          </>
        );
      case 'angry':
        return (
          <>
            <div className={`${baseStyle} left-1/4 top-1/4 transform -translate-x-1/2 -rotate-12`}></div>
            <div className={`${baseStyle} right-1/4 top-1/4 transform translate-x-1/2 rotate-12`}></div>
          </>
        );
      case 'worried':
        return (
          <>
            <div className={`${baseStyle} left-1/4 top-1/4 transform -translate-x-1/2 rotate-12`}></div>
            <div className={`${baseStyle} right-1/4 top-1/4 transform translate-x-1/2 rotate-12`}></div>
          </>
        );
      default: // normal
        return (
          <>
            <div className={`${baseStyle} left-1/4 top-1/4 transform -translate-x-1/2`}></div>
            <div className={`${baseStyle} right-1/4 top-1/4 transform translate-x-1/2`}></div>
          </>
        );
    }
  };

  const renderMouth = () => {
    const baseStyle = "absolute border border-gray-800";
    const sizes = mouthSizes[size];
    
    switch (avatar.mouth) {
      case 'laugh':
        return (
          <div className={`${baseStyle} ${sizes.wide} bg-black left-1/2 bottom-1/4 transform -translate-x-1/2`}></div>
        );
      case 'neutral':
        return (
          <div className={`${baseStyle} ${sizes.line} bg-black left-1/2 bottom-1/4 transform -translate-x-1/2`}></div>
        );
      case 'surprised':
        return (
          <div className={`${baseStyle} ${sizes.small} bg-black left-1/2 bottom-1/5 transform -translate-x-1/2`}></div>
        );
      case 'sad':
        return (
          <div className={`${baseStyle} ${sizes.normal} border-t-2 border-black bg-transparent left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-t-lg`}></div>
        );
      case 'tongue':
        return (
          <>
            <div className={`${baseStyle} ${sizes.normal} border-b-2 border-black bg-transparent left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-b-lg`}></div>
            <div className={`absolute w-1.5 h-1.5 bg-pink-400 border border-pink-600 left-1/2 bottom-1/5 transform -translate-x-1/2`}></div>
          </>
        );
      default: // smile
        return (
          <div className={`${baseStyle} ${sizes.normal} border-b-2 border-black bg-transparent left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-b-lg`}></div>
        );
    }
  };

  const renderAccessory = () => {
    if (avatar.accessory === 'none') return null;
    
    const baseStyle = `absolute flex items-center justify-center ${accessorySizes[size]}`;
    const animationClass = animate ? "animate-wiggle" : "";
    
    switch (avatar.accessory) {
      case 'glasses':
        return (
          <div className={`${baseStyle} left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 ${animationClass}`}>
            👓
          </div>
        );
      case 'sunglasses':
        return (
          <div className={`${baseStyle} left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 ${animationClass}`}>
            🕶️
          </div>
        );
      case 'hat':
        return (
          <div className={`${baseStyle} left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/3 ${animationClass}`}>
            🎩
          </div>
        );
      case 'crown':
        return (
          <div className={`${baseStyle} left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/3 ${animate ? 'animate-pulse-glow' : ''}`}>
            👑
          </div>
        );
      case 'headband':
        return (
          <div className={`${baseStyle} left-1/2 top-1/6 transform -translate-x-1/2 -translate-y-1/2 ${animationClass}`}>
            🎀
          </div>
        );
      default:
        return null;
    }
  };

  const containerAnimations = animate ? (isDrawing ? 'animate-bob' : '') : '';
  const borderGlow = isDrawing ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-white/20';

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full relative transition-all duration-300 border-2 ${borderGlow} ${containerAnimations} ${className}`}
      style={{ backgroundColor: avatar.color }}
    >
      {renderEyebrows()}
      {renderEyes()}
      {renderMouth()}
      {renderAccessory()}
      
      {isDrawing && (
        <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-xs rounded-full w-5 h-5 flex items-center justify-center text-white shadow-lg animate-pulse">
          ✏️
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;