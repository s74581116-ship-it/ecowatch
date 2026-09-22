interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  inverted?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true, inverted = false }: LogoProps) {
  const sizeMap = {
    sm: { box: 28, text: 'text-base font-bold' },
    md: { box: 36, text: 'text-xl font-bold' },
    lg: { box: 48, text: 'text-2xl font-black' },
    xl: { box: 64, text: 'text-3xl font-black' },
  };

  const { box, text } = sizeMap[size];

  return (
    <div id="ecowatch-logo-container" className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 
        Environmental Logo representing:
        - Earth (Outer sphere and orbital lines)
        - Nature & Leaves (Central leaf motif and organic venation)
        - Environmental Protection (Shield perimeter and guarding contours)
      */}
      <div
        id="ecowatch-logo-mark"
        className={`relative flex items-center justify-center rounded-xl shrink-0 shadow-xs transition-transform hover:scale-105 ${
          inverted ? 'bg-[#2F7D4A] text-white' : 'bg-[#174A35] text-white'
        }`}
        style={{ width: box, height: box }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[78%] h-[78%]"
          aria-label="EcoWatch Environmental Emblem"
        >
          {/* Earth sphere outline */}
          <circle cx="20" cy="20" r="17" stroke="white" strokeWidth="2" strokeDasharray="3 2" opacity="0.65" />
          
          {/* Protective shield silhouette */}
          <path
            d="M20 4L33 9V19C33 27.5 27.5 34.5 20 37C12.5 34.5 7 27.5 7 19V9L20 4Z"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          
          {/* Central organic leaf representing Nature */}
          <path
            d="M20 10C24.5 13 28 17.5 26 23C24 28 19 29.5 16 28C13 26.5 12 22 14.5 17C16.5 13 18.5 11 20 10Z"
            fill="white"
          />
          
          {/* Leaf vein line */}
          <path
            d="M17 26C19 22.5 21 17.5 23 13"
            stroke={inverted ? "#2F7D4A" : "#174A35"}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M19 21L23 20"
            stroke={inverted ? "#2F7D4A" : "#174A35"}
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M18 24L15 23"
            stroke={inverted ? "#2F7D4A" : "#174A35"}
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`tracking-tight font-extrabold ${inverted ? 'text-white' : 'text-[#17201B]'} ${text}`}>
            ECOWATCH
          </span>
          <span className={`text-[10px] uppercase tracking-widest font-semibold mt-0.5 ${inverted ? 'text-[#DCE5DE]' : 'text-[#65736A]'}`}>
            Report • Track • Protect
          </span>
        </div>
      )}
    </div>
  );
}
