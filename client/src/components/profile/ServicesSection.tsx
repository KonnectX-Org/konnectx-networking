import { useState, useRef, useEffect } from "react";
import userApi from "../../apis/userApi";
import { Plus, Check, X, Pencil, CircleAlert } from "lucide-react";
import { useUser } from "../../hooks/UserContext";
import { useSnackbar } from "../../hooks/SnackbarContext";

interface Service {
  name: string;
}

interface ServicesSectionProps {
  readOnly?: boolean;
  services?: Service[];
}

const ServicesSection = ({ readOnly = false, services: externalServices }: ServicesSectionProps) => {
  const { user, updateUser } = useUser();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newService, setNewService] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (readOnly && externalServices) {
      setServices(externalServices);
    } else if (user?.services) {
      setServices(user.services);
    }
  }, [user, readOnly, externalServices]);

  const updateServicesApi = async (servicesToUpdate: Service[]) => {
    setLoading(true);
    try {
      const response = await userApi.put("/user/update-services", {
        services: servicesToUpdate,
      });

      if (response.status === 200 && user) {
        updateUser({
          services: servicesToUpdate,
        });
        showSnackbar("Services updated successfully", "success");
      }
    } catch (err: any) {
      showSnackbar(
        err?.response?.data?.message || "Failed to update services",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.trim()) {
      showSnackbar("Service name cannot be empty", "error");
      return;
    }

    const serviceExists = services.some(
      (service) =>
        service.name.toLowerCase() === newService.trim().toLowerCase()
    );

    if (serviceExists) {
      showSnackbar("This service already exists", "error");
      return;
    }

    const updatedServices = [...services, { name: newService.trim() }];
    setServices(updatedServices);
    setNewService("");
    setShowAddInput(false);
    await updateServicesApi(updatedServices);
  };

  const handleDeleteService = async (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
    await updateServicesApi(updatedServices);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setShowAddInput(false);
    setNewService("");
  };

  useEffect(() => {
    if (showAddInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddInput]);

  // Don't render if readOnly and no services
  if (readOnly && services.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-3 rounded-lg">
      {!readOnly && loading && <div className="text-xs text-blue-500 mb-2">Saving...</div>}

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 items-center">
          <h3 className="text-sm font-medium">Services</h3>
          {!readOnly && services.length === 0 && (
            <CircleAlert size={14} className="text-red-500" />
          )}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {services.length > 0 && (
              <button
                onClick={toggleEditMode}
                className={`p-1 rounded transition-colors ${
                  isEditMode ? "bg-blue-100 text-blue-600" : "text-black"
                }`}
                title={isEditMode ? "Exit edit mode" : "Edit services"}
              >
                <Pencil size={16} />
              </button>
            )}

            {(services.length === 0 || isEditMode) && !showAddInput && (
              <button
                onClick={() => setShowAddInput(true)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Add service"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {!readOnly && showAddInput && (
        <div className="flex items-center gap-2 mb-4">
          <input
            ref={inputRef}
            type="text"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            placeholder="Add a service..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddService();
              if (e.key === "Escape") {
                setShowAddInput(false);
                setNewService("");
              }
            }}
          />
          <button
            onClick={handleAddService}
            className="p-2 text-green-600 hover:bg-green-50 rounded"
            title="Save"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => {
              setShowAddInput(false);
              setNewService("");
            }}
            className="p-2 text-gray-400 hover:bg-gray-50 rounded"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {services.length > 0 ? (
          services.map((service, index) => (
            <div
              key={index}
              className={`px-4 py-2 rounded-full flex items-center gap-1 text-sm ${
                !readOnly && isEditMode
                  ? "bg-black text-white"
                  : "bg-black text-white"
              }`}
            >
              <span>{service.name}</span>
              {!readOnly && isEditMode && (
                <button
                  onClick={() => handleDeleteService(index)}
                  className="ml-1 text-white opacity-80 hover:opacity-100"
                  title="Delete service"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))
        ) : (
          !readOnly && <div className="text-gray-500 text-sm">No services added</div>
        )}
      </div>
    </div>
  );
};

export default ServicesSection;
