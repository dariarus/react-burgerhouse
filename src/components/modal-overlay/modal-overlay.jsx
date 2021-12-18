import React from "react";
import PropTypes from 'prop-types';

import modalOverlayStyle from './modal-overlay.module.css';

export function ModalOverlay(props) {
  return (
    <div className={modalOverlayStyle.overlay} onClick={props.handleOnClose}>
    </div>
  )
}

ModalOverlay.propTypes = {
  handleOnClose: PropTypes.func.isRequired
}