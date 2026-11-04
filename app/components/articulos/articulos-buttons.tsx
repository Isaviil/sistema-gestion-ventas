import React from "react";
import Button from "../ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface ArticulosActionsProps {
  onAdd?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  showAdd?: boolean;
  showView?: boolean;
  showDelete?: boolean;
  disableAdd?: boolean;
  disableView?: boolean;
  disableDelete?: boolean;
}

export const ArticulosActions: React.FC<ArticulosActionsProps> = ({
  onAdd,
  onView,
  onDelete,
  showAdd = true,
  showView = true,
  showDelete = true,
  disableAdd = false,
  disableView = false,
  disableDelete = false,
}) => {
  return (
    <div className="flex items-center justify-end gap-1">
      {showAdd && (
        <Button
          onClick={onAdd}
          variant="success"
          size="xs"
          className="cursor-pointer"
          disabled={disableAdd}
        >
          <Plus size={14} className="mr-1" />
          Agregar
        </Button>
      )}

      {showView && (
        <Button
          onClick={onView}
          variant="info"
          size="xs"
          className="cursor-pointer"
          disabled={disableView}
        >
          <Pencil size={14} className="mr-1" />
          Editar
        </Button>
      )}

      {showDelete && (
        <Button
          onClick={onDelete}
          variant="danger"
          size="xs"
          className="cursor-pointer"
          disabled={disableDelete}
        >
          <Trash2 size={14} className="mr-1" />
          Eliminar
        </Button>
      )}
    </div>
  );
};
