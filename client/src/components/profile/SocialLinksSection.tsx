import React, { useState, useRef, useEffect } from "react";
import userApi from "../../apis/userApi";
import { Plus, Check, X, CircleAlert } from "lucide-react";
import { Instagram, LinkedIn } from "@mui/icons-material";
import { Icon } from "@iconify/react";
import { useUser } from "../../hooks/UserContext";

type SocialType = "instagram" | "linkedin" | "link";

interface SocialLink {
  type: SocialType;
  url: string;
  icon: React.ComponentType<any>;
}

export default function SocialLinks() {
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingUrl, setEditingUrl] = useState("");
  const addMenuRef = useRef<HTMLDivElement>(null);

  const socialTypes: Record<
    SocialType,
    {
      label: string;
      baseUrl: string;
      icon: React.ComponentType<any>;
      pattern: RegExp;
    }
  > = {
    instagram: {
      label: "Instagram",
      baseUrl: "https://instagram.com/",
      icon: Instagram,
      pattern: /instagram\.com/i,
    },
    linkedin: {
      label: "LinkedIn",
      baseUrl: "https://linkedin.com/in/",
      icon: LinkedIn,
      pattern: /linkedin\.com/i,
    },
    link: {
      label: "Other",
      baseUrl: "https://",
      icon: () => <Icon icon="lucide:link" />,
      pattern: /.*/,
    },
  };

  useEffect(() => {
    if (user?.socialLinks) {
      const initialLinks = user.socialLinks.map((link) => ({
        type: link.type as SocialType,
        url: link.url,
        icon: socialTypes[link.type as SocialType].icon,
      }));
      setLinks(initialLinks);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(event.target as Node)
      ) {
        setShowAddMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateSocialLinksApi = async (linksToUpdate: SocialLink[]) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        socialLinks: linksToUpdate.map((link) => ({
          type: link.type,
          url: link.url,
        })),
      };
      const response = await userApi.put("/user/update-social-links", payload);

      // Update user context after successful API call
      if (response.status === 200 && user) {
        updateUser({
          socialLinks: linksToUpdate.map((link) => ({
            type: link.type,
            url: link.url,
          })),
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update social links");
    } finally {
      setLoading(false);
    }
  };

  const detectLinkType = (url: string): SocialType => {
    for (const [type, config] of Object.entries(socialTypes)) {
      if (type !== "link" && config.pattern.test(url)) {
        return type as SocialType;
      }
    }
    return "link";
  };

  const handleAddPlatform = async (type: SocialType) => {
    const newLink = {
      type,
      url: socialTypes[type].baseUrl,
      icon: socialTypes[type].icon,
    };

    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    setShowAddMenu(false);
    setEditingIndex(updatedLinks.length - 1);
    setEditingUrl(socialTypes[type].baseUrl);
    await updateSocialLinksApi(updatedLinks);
  };

  const handleEditUrl = (index: number, url: string) => {
    setEditingUrl(url);

    // Auto-detect and update link type based on URL
    const detectedType = detectLinkType(url);
    const updatedLinks = [...links];
    if (updatedLinks[index].type !== detectedType) {
      updatedLinks[index] = {
        ...updatedLinks[index],
        type: detectedType,
        icon: socialTypes[detectedType].icon,
      };
      setLinks(updatedLinks);
    }
  };

  const handleSaveEdit = async (index: number) => {
    const updatedLinks = [...links];
    updatedLinks[index].url = editingUrl;
    setLinks(updatedLinks);
    setEditingIndex(null);
    setEditingUrl("");
    await updateSocialLinksApi(updatedLinks);
  };

  const handleCancelEdit = () => {
    if (
      editingIndex !== null &&
      links[editingIndex].url === socialTypes[links[editingIndex].type].baseUrl
    ) {
      // Remove the newly added link if it was just created and cancelled
      handleDelete(editingIndex);
    } else {
      setEditingIndex(null);
      setEditingUrl("");
    }
  };

  const handleDelete = async (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
    setEditingIndex(null);
    setEditingUrl("");
    await updateSocialLinksApi(updatedLinks);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingUrl(links[index].url);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setEditingIndex(null);
    setEditingUrl("");
    setShowAddMenu(false);
  };

  return (
    <div className="bg-white p-3 rounded-lg">
      {loading && <div className="text-xs text-blue-500 mb-2">Saving...</div>}
      {error && <div className="text-xs text-red-500 mb-2">{error}</div>}

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 items-center">
          <h3 className="text-sm font-medium">Social Links</h3>
          {links.length === 0 && (
            <CircleAlert size={14} className="text-red-500" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {links.length > 0 && (
            <button
              onClick={toggleEditMode}
              className={`p-1 rounded transition-colors ${
                isEditMode ? "bg-blue-100 text-blue-600" : "text-black"
              }`}
              title={isEditMode ? "Exit edit mode" : "Edit social links"}
            >
              <Icon icon="material-symbols:edit-outline-rounded" />
            </button>
          )}

          {(links.length === 0 || isEditMode) && (
            <div className="relative" ref={addMenuRef}>
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Add social link"
              >
                <Plus size={20} />
              </button>

              {showAddMenu && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {Object.entries(socialTypes).map(([key, { label, icon }]) => (
                    <button
                      key={key}
                      onClick={() => handleAddPlatform(key as SocialType)}
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
          )}
        </div>
      </div>

      <div className="space-y-3">
        {links.length > 0 ? (
          links.map((link, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                <link.icon size={16} className="text-gray-600" />
              </div>

              {editingIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editingUrl}
                    onChange={(e) => handleEditUrl(index, e.target.value)}
                    className="flex-1 w-4 px-3 py-2 border border-gray-200 rounded-md text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(index)}
                    className="p-2  rounded"
                    title="Save"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2   rounded"
                    title="Cancel"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={link.url}
                    readOnly
                    className={`flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm ${
                      isEditMode
                        ? "bg-white cursor-pointer hover:bg-gray-50"
                        : "bg-gray-50"
                    }`}
                    onClick={() => isEditMode && startEditing(index)}
                    title={isEditMode ? "Click to edit" : ""}
                  />
                  {isEditMode && (
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete link"
                    >
                      <X size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-sm">No social links added</div>
        )}
      </div>
    </div>
  );
}
