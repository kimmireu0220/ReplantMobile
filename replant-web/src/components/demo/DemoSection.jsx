import React from 'react';
import { tokens } from '../../design/tokens';

const DemoSection = ({ 
  title, 
  description, 
  children, 
  className = '' 
}) => {
  const sectionStyle = {
    marginBottom: tokens.spacing[8],
    padding: tokens.spacing[6],
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.light}`,
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2],
  };

  const descriptionStyle = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[6],
    lineHeight: tokens.typography.lineHeight.relaxed,
  };

  return (
    <section style={sectionStyle} className={`demo-section ${className}`}>
      <h2 style={titleStyle}>{title}</h2>
      {description && (
        <p style={descriptionStyle}>{description}</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
        {children}
      </div>
    </section>
  );
};

export default DemoSection;
