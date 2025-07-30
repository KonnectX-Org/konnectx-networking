import React, { useState, useRef, useEffect } from "react";
import { Plus, Link, Check, X, ChevronDown } from "lucide-react";
import { Instagram, LinkedIn } from "@mui/icons-material";
import { Icon } from "@iconify/react";


type SocialType = "instagram" | "linkedin" | "link";

interface SocialLink {
  type: SocialType;
  url: string;
  icon: React.ComponentType<any>;
}

export default function SocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [selectedType, setSelectedType] = useState<SocialType>("instagram");
  const [inputValue, setInputValue] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLinks, setEditingLinks] = useState<{[key: number]: {type: SocialType, url: string, dropdownOpen: boolean}}>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const socialTypes: Record<
    SocialType,
    { label: string; baseUrl: string; icon: React.ComponentType<any> }
  > = {
    instagram: {
      label: "Instagram",
      baseUrl: "https://instagram.com/",
      icon: Instagram,
    },
    linkedin: {
      label: "LinkedIn",
      baseUrl: "https://linkedin.com/in/",
      icon: LinkedIn,
    },
    link: { label: "Other", baseUrl: "https://", icon: Link },
  };

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      
      // Close any open editing dropdowns
      const target = event.target as HTMLElement;
      const clickedOnDropdown = target.closest('.relative');
      if (!clickedOnDropdown) {
        setEditingLinks(prev => {
          const newState = { ...prev };
          Object.keys(newState).forEach(key => {
            newState[parseInt(key)].dropdownOpen = false;
          });
          return newState;
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTypeChange = (type: SocialType) => {
    setSelectedType(type);
    setInputValue(socialTypes[type].baseUrl);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEditLinkTypeChange = (index: number, type: SocialType) => {
    setEditingLinks(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        type,
        dropdownOpen: false
      }
    }));
  };

  const toggleEditLinkDropdown = (index: number) => {
    setEditingLinks(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        dropdownOpen: !prev[index]?.dropdownOpen
      }
    }));
  };

  const handleEditLinkChange = (index: number, url: string) => {
    setEditingLinks(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        url
      }
    }));
  };

  const startEditingLink = (index: number) => {
    const link = links[index];
    setEditingLinks(prev => ({
      ...prev,
      [index]: {
        type: link.type,
        url: link.url,
        dropdownOpen: false
      }
    }));
  };

  const cancelEditingLink = (index: number) => {
    setEditingLinks(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const handleAdd = () => {
    if (inputValue.trim()) {
      const newLink = {
        type: selectedType,
        url: inputValue,
        icon: socialTypes[selectedType].icon,
      };

      if (editingIndex !== null) {
        // Update existing link
        const updatedLinks = [...links];
        updatedLinks[editingIndex] = newLink;
        setLinks(updatedLinks);
        setEditingIndex(null);
      } else {
        // Add new link
        setLinks([...links, newLink]);
      }

      setShowInput(false);
      setIsEditMode(false)
      setInputValue("");
    }
  };

  const handleCancel = () => {
    setShowInput(false);
    setInputValue("");
    setEditingIndex(null);
      setIsEditMode(false)

  };

  const handleDelete = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
  };

  const handleStartAdd = () => {
    setEditingIndex(null);
    setShowInput(true);
    setInputValue(socialTypes[selectedType].baseUrl);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    // If entering edit mode, initialize editing state for all links
    if (!isEditMode) {
      const initialEditingState: {[key: number]: {type: SocialType, url: string, dropdownOpen: boolean}} = {};
      links.forEach((link, index) => {
        initialEditingState[index] = {
          type: link.type,
          url: link.url,
          dropdownOpen: false
        };
      });
      setEditingLinks(initialEditingState);
    } else {
      // If exiting edit mode, clear editing state and hide the input form
      setEditingLinks({});
      setShowInput(false);
      setInputValue("");
      setEditingIndex(null);
    }
  };

  return (
    <div className="bg-white p-3 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Social</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleEditMode}
            className={`p-1 rounded transition-colors ${
              isEditMode
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600"
            }`}
            title={isEditMode ? "Exit edit mode" : "Edit social links"}
          >
            <Icon
            //   onClick={() => setIsInterestModalOpen(true)}
              icon={"material-symbols:edit-outline-rounded"}
            //   fontSize={"16px"}
            />
          </button>
          {isEditMode && (
            <button onClick={handleStartAdd} className="p-1">
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {links.map((link, index) => {
          const isLinkBeingEdited = isEditMode && editingLinks[index];
          const editingData = editingLinks[index];
          
          return (
            <div key={index} className="flex items-center gap-3">
              {isLinkBeingEdited ? (
                // Editable version with dropdown
                <>
                  <div className="relative">
                    {/* Custom Dropdown Button for editing */}
                    <button
                      type="button"
                      onClick={() => toggleEditLinkDropdown(index)}
                      className="w-12 h-10 px-2 py-1 border border-gray-200 rounded text-sm bg-white cursor-pointer flex items-center justify-center hover:bg-gray-50"
                    >
                      {React.createElement(socialTypes[editingData.type].icon, {
                        size: 16,
                        className: "text-gray-600",
                      })}
                      <ChevronDown size={12} className="ml-1 text-gray-400" />
                    </button>

                    {/* Custom Dropdown Menu for editing */}
                    {editingData.dropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        {Object.entries(socialTypes).map(([key, { label, icon }]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleEditLinkTypeChange(index, key as SocialType)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm first:rounded-t-md last:rounded-b-md"
                          >
                            {React.createElement(icon, {
                              size: 16,
                              className: "text-gray-600",
                            })}
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editingData.url}
                    onChange={(e) => handleEditLinkChange(index, e.target.value)}
                    className="flex-1 w-4 px-3 py-2 border border-gray-200 rounded-md text-sm"
                  />
                  <button
                    onClick={() => cancelEditingLink(index)}
                    className="p-2 text-black rounded hover:bg-gray-200 flex items-center justify-center"
                    title="Cancel"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                // Read-only version
                <>
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <link.icon size={16} className="text-gray-600" />
                  </div>
                  <input
                    type="text"
                    value={link.url}
                    readOnly
                    className={`flex-1 w-4 px-3 py-2 border border-gray-200 rounded-md text-sm ${
                      isEditMode 
                        ? "bg-white cursor-pointer hover:bg-gray-50" 
                        : "bg-gray-50"
                    }`}
                    onClick={() => isEditMode && startEditingLink(index)}
                    title={isEditMode ? "Click to edit" : ""}
                  />
                  {isEditMode && (
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete link"
                    >
                      <X size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}

        {showInput && isEditMode && (
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-md">
            <div className="relative" ref={dropdownRef}>
              {/* Custom Dropdown Button */}
              <button
                type="button"
                onClick={toggleDropdown}
                className="w-12 h-10 px-2 py-1 border border-gray-200 rounded text-sm bg-white cursor-pointer flex items-center justify-center hover:bg-gray-50"
              >
                {React.createElement(socialTypes[selectedType].icon, {
                  size: 16,
                  className: "text-gray-600",
                })}
                <ChevronDown size={12} className="ml-1 text-gray-400" />
              </button>

              {/* Custom Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {Object.entries(socialTypes).map(([key, { label, icon }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTypeChange(key as SocialType)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm first:rounded-t-md last:rounded-b-md"
                    >
                      {React.createElement(icon, {
                        size: 16,
                        className: "text-gray-600",
                      })}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter URL"
              className="flex-1 w-3 px-3 py-2 border border-gray-200 rounded-md text-sm"
              autoFocus
            />
            <button
              onClick={handleAdd}
              className="p-2 text-black rounded hover:bg-gray-200 flex items-center justify-center"
              title="Add"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="p-2   text-black rounded hover:bg-gray-200  flex items-center justify-center"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
