import React, { useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import "../styles/Sidebar.css";
import Icon from "./Icon";

interface Tab {
  id: number;
  title: string;
  src: string;
  url: string;
  spritePosition: string;
  spritePath: string;
  itemQuality: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  activeTabId: number;
  setActiveTabId: (id: number) => void;
  onAddTab: () => void;
  onCloseTab: (id: number) => void;
  onReorderTabs: (sourceIndex: number, destinationIndex: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  setActiveTabId,
  onAddTab,
  onCloseTab,
  onReorderTabs,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    onReorderTabs(source.index, destination.index);
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? "open" : ""}`} ref={sidebarRef}>
        <div className="sidebar-content">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tab-list">
              {(provided) => (
                <ul
                  className="tab-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {tabs.map((tab, index) => (
                    <Draggable
                      key={tab.id}
                      draggableId={tab.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            background: snapshot.isDragging ? "#777" : "",
                          }}
                          className={`tab-item ${
                            tab.id === activeTabId ? "active" : ""
                          }`}
                          onClick={() => {
                            setActiveTabId(tab.id);
                            onClose();
                          }}
                        >
                          {" "}
                          <Icon
                            position={tab.spritePosition}
                            spritePath={tab.spritePath}
                            quality={tab.itemQuality}
                            scale={0.4}
                          />
                          <span className="tab-title">{tab.title}</span>
                          <span
                            className="tab-close-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCloseTab(tab.id);
                            }}
                          >
                            <img
                              src="./assets/title_bar_icons/close.svg"
                              alt="Close"
                            />
                          </span>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          <div className="add-tab-button" onClick={onAddTab}>
            <img src="./assets/title_bar_icons/add.svg" alt="Add Tab" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
