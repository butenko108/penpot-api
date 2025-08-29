import React from 'react';

const ButtonFilledMdSquare = ({ 
  label = "Label",
  onClick,
  disabled = false,
  style = {},
  className = "",
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
    backgroundColor: '#034c8c',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...style
  };

  const labelStyle = {
    fontFamily: 'sourcesanspro, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    textAlign: 'left',
    color: '#e6f0f9',
    width: '33px',
    height: '21px',
    margin: 0,
    padding: 0
  };

  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      <span style={labelStyle}>
        {label}
      </span>
    </button>
  );
};

export default ButtonFilledMdSquare;