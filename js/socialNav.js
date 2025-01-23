import React, { useState } from 'react';
import { Youtube, Twitter, Music2, Music } from 'lucide-react';

const SocialNav = () => {
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [isNavHovered, setIsNavHovered] = useState(false);

  const socialLinks = [
    { id: 'youtube', Icon: Youtube, href: 'https://youtube.com/@dollallama' },
    { id: 'soundcloud', Icon: Music2, href: 'https://soundcloud.com/dolla-llama' },
    { id: 'spotify', Icon: Music, href: 'https://open.spotify.com/artist/dollallama' },
    { id: 'twitter', Icon: Twitter, href: 'https://twitter.com/dollallama' }
  ];

  return (
    <div 
      className="bottom-nav"
      onMouseEnter={() => setIsNavHovered(true)}
      onMouseLeave={() => {
        setIsNavHovered(false);
        setHoveredIcon(null);
      }}
    >
      <div className="nav-links">
        {socialLinks.map(({ id, Icon, href }) => (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-black/20 rounded-lg transition-all duration-200"
            onMouseEnter={() => setHoveredIcon(id)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <Icon 
              size={24}
              color={
                isNavHovered
                  ? hoveredIcon === id
                    ? 'white'
                    : '#9ca3af'
                  : 'white'
              }
              strokeWidth={2}
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialNav;