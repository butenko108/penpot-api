import React from 'react';

const ButtonLinkMd = ({ 
  label = 'Label',
  onClick,
  disabled = false,
  className = '',
  style = {},
  ...props 
}) => {
  const buttonStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '9px 25px',
    gap: '0px',
    width: '83px',
    height: '39px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...style
  };

  const boardStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '0px',
    gap: '0px',
    width: '33px',
    height: '21px',
    borderRadius: '0px'
  };

  const labelStyle = {
    width: '33px',
    height: '21px',
    fontFamily: 'sourcesanspro, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    textAlign: 'left',
    color: '#367ebc',
    margin: 0,
    padding: 0,
    border: 'none',
    background: 'transparent'
  };

  return (
    <button
      style={buttonStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      <div style={boardStyle}>
        <span style={labelStyle}>
          {label}
        </span>
      </div>
    </button>
  );
};

export default ButtonLinkMd;