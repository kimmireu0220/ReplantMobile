import React from 'react';
import { tokens } from '../../design/tokens';

const ComponentDemo = ({ 
  title, 
  description, 
  code, 
  children, 
  className = '' 
}) => {
  const demoStyle = {
    marginBottom: tokens.spacing[6],
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.border.light}`,
  };

  const titleStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2],
  };

  const descriptionStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[4],
    lineHeight: tokens.typography.lineHeight.normal,
  };

  const codeStyle = {
    backgroundColor: tokens.colors.background.tertiary,
    padding: tokens.spacing[3],
    borderRadius: tokens.borderRadius.sm,
    fontFamily: 'monospace',
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.primary,
    border: `1px solid ${tokens.colors.border.light}`,
    marginTop: tokens.spacing[3],
    overflow: 'auto',
  };

  const previewStyle = {
    padding: tokens.spacing[4],
    border: `1px solid ${tokens.colors.border.light}`,
    borderRadius: tokens.borderRadius.sm,
    backgroundColor: tokens.colors.background.secondary,
    marginBottom: tokens.spacing[3],
  };

  return (
    <div style={demoStyle} className={`component-demo ${className}`}>
      <h3 style={titleStyle}>{title}</h3>
      {description && (
        <p style={descriptionStyle}>{description}</p>
      )}
      
      <div style={previewStyle}>
        {children}
      </div>
      
      {code && (
        <pre style={codeStyle}>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

export default ComponentDemo;
