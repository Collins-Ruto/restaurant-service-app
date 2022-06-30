import React from 'react'
import { logout } from '../../js/near/utils';
import '../../css/navigation.css'

function Navigation() {
  return (
    <div className="nav-bar">
      <nav className="d-flex nav">
        <ul className="d-flex list-unstyled">
          <li className="p-2">
            <a href=".home">HOME</a>
          </li>
          <li className="p-2">
            <a href=".menu">MENU</a>
          </li>
          <li className="p-2">
            <a href=".order">ORDER</a>
          </li>
          <li className="p-2">
            <a href=".about">ABOUT</a>
          </li>
        </ul>
        <button
          className="link ml-auto p-2"
          style={{ float: "right" }}
          onClick={logout}
        >
          Sign out
        </button>
      </nav>
    </div>
  );
}

export default Navigation