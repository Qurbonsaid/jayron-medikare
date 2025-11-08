import React from 'react';

interface Props {
  role:'admin'|'ceo'|'doctor'|'nurse'|'receptionist';
  allowed:string[]
  children: React.ReactNode;
}

const RBS = ({ children , allowed,role}: Props) => {
  if(allowed.includes(role)){
    return children
  }
  return null;
};

export default RBS;