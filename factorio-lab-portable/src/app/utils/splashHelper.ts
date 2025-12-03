import { useState, useEffect } from "react";
import { SplashMessage } from "../../components/Splash";

interface UseSplashResult {
  splashMessages: SplashMessage[];
  showSplash: (id: string, title: string, body: string) => void;
  startSplash: (id: string, title: string, body: string) => void;
  removeSplash: (id: string) => void;
}

export const splashTimer = 2000;

export const useSplash = (): UseSplashResult => {
  const [splashMessages, setSplashMessages] = useState<SplashMessage[]>([]);

  const showSplash = (id: string, title: string, body: string) => {
    const newMessage: SplashMessage = {
      id: id,
      title,
      body: body,
      isPersistent: false,
    };
    setSplashMessages((prev) => {
      const filteredMessages = prev.filter((m) => m.id !== id);
      return [...filteredMessages, newMessage];
    });
  };

  const startSplash = (id: string, title: string, body: string) => {
    const newMessage: SplashMessage = {
      id,
      title,
      body,
      isPersistent: true,
    };

    setSplashMessages((prev) => {
      const existingIndex = prev.findIndex((m) => m.id === id);

      if (existingIndex !== -1) {
        const updatedMessages = [...prev];
        updatedMessages[existingIndex] = newMessage;
        return updatedMessages;
      } else {
        return [...prev, newMessage];
      }
    });
  };

  const removeSplash = (id: string) => {
    setTimeout(() => {
      setSplashMessages((prev) => prev.filter((message) => message.id !== id));
    }, splashTimer);
  };

  useEffect(() => {
    if (splashMessages.length === 0) return;
    const messageToFade = splashMessages.find((m) => !m.isPersistent);
    if (!messageToFade) return;
    const messageId = messageToFade.id;
    setTimeout(() => {
      setSplashMessages((prev) =>
        prev.filter((message) => message.id !== messageId)
      );
    }, splashTimer);
  }, [splashMessages]);

  return {
    splashMessages,
    showSplash,
    startSplash,
    removeSplash,
  };
};
