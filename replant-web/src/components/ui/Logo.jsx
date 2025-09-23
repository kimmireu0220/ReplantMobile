import React from 'react';
import logoImage from '../../assets/logo.png';

const Logo = ({ 
  size = 24, 
  style = {}, 
  className = '',
  alt = 'Replant 로고'
}) => {
  const logoStyle = {
    width: size,
    height: size,
    objectFit: 'contain',
    ...style
  };

  return (
    <img 
      src={logoImage} 
      alt={alt}
      style={logoStyle}
      className={className}
    />
  );
};

export default Logo; 