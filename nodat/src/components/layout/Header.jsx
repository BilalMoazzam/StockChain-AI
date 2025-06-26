import React, { useContext } from "react";
import "../styles/Header.css";
import { UserContext } from "../../context/UserContext";

const Header = ({ title, breadcrumbs }) => {
  const { username } = useContext(UserContext);
  

  return (
    <div className="header">
      <div className="header-left">
        <h1>{title}</h1>
        <div className="breadcrumbs">
          {Array.isArray(breadcrumbs) && breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <span className={crumb.active ? "active" : ""}>{crumb.text}</span>
              {index < breadcrumbs.length - 1 && <span className="separator">/</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="user-profile">
        <span className="user-name">{username || "Guest"}</span>
        <div className="avatar">
          <img src="/bm.jpeg" alt="User" />
        </div>
      </div>
    </div>
  );
};

export default Header;
