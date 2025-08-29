import React from 'react';

const ButtonOutlinedMdsquare = ({ 
  children = "Label",
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
    gap: '0px',
    width: '83px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #999999',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxSizing: 'border-box',
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
    padding: 0,
    border: 'none',
    background: 'none',
    outline: 'none'
  };

  return (
    <button
      style={buttonStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      <span style={labelStyle}>
        {children}
      </span>
    </button>
  );
};

export default ButtonOutlinedMdsquare;