import React from "react";
import "../styles/Splash.css";

export interface SplashMessage {
  id: string;
  title: string;
  body: string;
  isPersistent?: boolean;
}

interface SplashProps {
  messages: SplashMessage[];
}

const Splash: React.FC<SplashProps> = ({ messages }) => {
  if (messages.length === 0) {
    return null;
  }

  const nonPersistent = messages.filter((m) => !m.isPersistent);
  const persistent = messages.filter((m) => m.isPersistent);
  const orderedMessages = [...nonPersistent, ...persistent];

  return (
    <div className="splash-overlay">
      {orderedMessages.map((message) => (
        <div key={message.id} className="splash-message">
          <h3>{message.title}</h3>
          <p>{message.body}</p>
        </div>
      ))}
    </div>
  );
};

export default Splash;
