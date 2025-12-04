import { RoleConstants } from '@/constants/Roles';
import React from 'react';

interface Props {
  role:RoleConstants;
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