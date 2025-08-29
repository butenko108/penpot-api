import React from 'react';

const ButtonElevatedMdsquare = ({ 
  children = 'Label',
  onClick,
  disabled = false,
  style = {},
  ...props 
}) => {
  const buttonStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '9.5px 25px',
    width: '83px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: `
      0px 1px 2px 0px rgba(0, 0, 0, 0.3),
      0px 1px 3px 1px rgba(0, 0, 0, 0.15)
    `,
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    ...style
  };

  const labelStyle = {
    fontFamily: 'sourcesanspro, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    textAlign: 'left',
    color: '#02325b',
    margin: 0,
    padding: 0
  };

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      <span style={labelStyle}>
        {children}
      </span>
    </button>
  );
};

export default ButtonElevatedMdsquare;