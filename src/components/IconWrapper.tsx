/**
 * Icon Wrapper Component
 * 
 * Ensures MaterialCommunityIcons is properly available for react-native-paper
 */

import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const IconWrapper: React.FC<any> = (props) => {
  return <MaterialCommunityIcons {...props} />;
};

export default IconWrapper;

