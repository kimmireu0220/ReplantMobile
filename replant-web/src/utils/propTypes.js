/**
 * 공통 PropTypes 정의
 * 프로젝트 전반에서 사용되는 Props 타입들을 중앙화하여 관리
 */

import PropTypes from 'prop-types';

// Button Props
export const ButtonPropTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'base', 'lg', 'xl']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  style: PropTypes.object,
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  rounded: PropTypes.bool,
  href: PropTypes.string,
  target: PropTypes.string,
};

// Card Props
export const CardPropTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'mission', 'dex']),
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

// Progress Props
export const ProgressPropTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'base', 'lg']),
  variant: PropTypes.oneOf(['primary', 'secondary']),
  showPercentage: PropTypes.bool,
  label: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  animated: PropTypes.bool,
  striped: PropTypes.bool,
};